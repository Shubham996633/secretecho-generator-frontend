// utils/gemini-webSocket-client.ts
import { WebSocketMessage } from "@/types/plugins.types";
import { EventEmitter } from "eventemitter3";

interface WebSocketClientEvents {
	open: () => void;
	message: (data: WebSocketMessage) => void;
	error: (error: Event) => void;
	close: (event: CloseEvent) => void;
}

export class WebSocketClient extends EventEmitter<WebSocketClientEvents> {
	private ws: WebSocket | null = null;
	private url: string;
	private isConnecting: boolean = false;
	private maxRetries: number = 3;
	private retryDelay: number = 2000; // 2 seconds

	constructor(url: string) {
		super();
		this.url = url;
	}

	updateUrl(newUrl: string): void {
		if (this.url === newUrl) {
			console.log("URL unchanged, no update needed");
			return;
		}
		console.log(`Updating WebSocket URL from ${this.url} to ${newUrl}`);
		this.url = newUrl;
	}

	async connect(attempt: number = 0): Promise<boolean> {
		if (this.isConnecting) {
			console.log("Already connecting, skipping new connection attempt");
			return Promise.resolve(false);
		}

		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			console.log("WebSocket already connected");
			return Promise.resolve(true);
		}

		this.isConnecting = true;
		console.log(`Attempting WebSocket connection (Attempt ${attempt + 1}/${this.maxRetries + 1})...`);

		try {
			this.ws = new WebSocket(this.url);
			const result = await new Promise<boolean>((resolve, reject) => {
				const onError = (ev: Event) => {
					this.isConnecting = false;
					this.disconnect();
					this.emit("error", ev);
					reject(new Error(`Could not connect to ${this.url}`));
				};

				const onOpen = () => {
					this.isConnecting = false;
					this.emit("open");
					// Safely remove the error listener if ws still exists
					if (this.ws) {
						this.ws.removeEventListener("error", onError);
					}
					resolve(true);
				};

				if (!this.ws) {
					reject(new Error("WebSocket instance is null"));
					return;
				}

				this.ws.addEventListener("error", onError);
				this.ws.addEventListener("open", onOpen);

				this.ws.addEventListener("message", (evt: MessageEvent) => {
					try {
						const data = JSON.parse(evt.data);
						if (data.type && (data.type === "chat" || data.type === "code") && data.response) {
							const message: WebSocketMessage = {
								type: data.type,
								response: data.response,
								sender: data.sender,
								isFinal: data.isFinal,
							};
							this.emit("message", message);
						} else if (data.status === "connected" || data.setupComplete) {
							// Ignore connection status and setup complete messages
						} else if (data.error) {
							this.emit("error", new Event(`Server error: ${data.error}`));
						} else {
							console.warn("Invalid message format", data);
							this.emit("error", new Event("Invalid message format"));
						}
					} catch {
						this.emit("error", new Event("Invalid message format"));
					}
				});

				this.ws.addEventListener("close", (ev: CloseEvent) => {
					this.isConnecting = false;
					this.disconnect();
					this.emit("close", ev);
				});
			});

			return result;
		} catch (error) {
			if (attempt < this.maxRetries) {
				console.log(`Connection failed. Retrying in ${this.retryDelay}ms... (Attempt ${attempt + 1} failed)`);
				await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
				return this.connect(attempt + 1);
			}
			throw error; // After max retries, throw the error
		}
	}

	send(data: { message: string; pluginId: string }) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}
		this.ws.send(JSON.stringify(data));
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.isConnecting = false;
	}

	isConnected() {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}
