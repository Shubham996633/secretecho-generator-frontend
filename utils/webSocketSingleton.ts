// utils/webSocketSingleton.ts
import { WebSocketClient } from "@/utils/gemini-webSocket-client";

export class WebSocketSingleton {
	private static instance: WebSocketClient | null = null;
	private static url: string | null = null;

	static getInstance(url: string): WebSocketClient {
		if (!this.instance || this.url !== url) {
			console.log(`Creating new WebSocketClient instance with URL: ${url}`);
			this.url = url;
			this.instance = new WebSocketClient(url);
		}
		return this.instance;
	}

	static clearInstance() {
		if (this.instance) {
			this.instance.disconnect();
			this.instance = null;
			this.url = null;
		}
	}
}
