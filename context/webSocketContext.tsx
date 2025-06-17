// context/websocket-context.tsx
"use client";

import { WebSocketSingleton } from "@/utils/webSocketSingleton";
import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type WebSocketContextType = {
	client: ReturnType<typeof WebSocketSingleton.getInstance>;
	connected: boolean;
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export type WebSocketProviderProps = {
	children: ReactNode;
	url: string;
};

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children, url }) => {
	const client = WebSocketSingleton.getInstance(url);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		client.updateUrl(url); // Update the URL in the singleton instance

		const connectClient = async () => {
			try {
				await client.connect();
				setConnected(true);
			} catch (error) {
				console.error("Failed to connect WebSocket on URL change:", error);
				setConnected(false);
			}
		};

		connectClient();

		const onOpen = () => {
			setConnected(true);
		};

		const onClose = () => {
			setConnected(false);
		};

		client.on("open", onOpen);
		client.on("close", onClose);

		return () => {
			client.off("open", onOpen);
			client.off("close", onClose);
		};
	}, [client, url]); // Reconnect when URL changes

	const connect = useCallback(async () => {
		try {
			await client.connect();
			setConnected(true);
		} catch (error) {
			console.error("Failed to connect WebSocket:", error);
			setConnected(false);
			throw error;
		}
	}, [client]);

	const disconnect = useCallback(async () => {
		client.disconnect();
		setConnected(false);
	}, [client]);

	return (
		<WebSocketContext.Provider value={{ client, connected, connect, disconnect }}>{children}</WebSocketContext.Provider>
	);
};

export const useWebSocketContext = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocketContext must be used within a WebSocketProvider");
	}
	return context;
};
