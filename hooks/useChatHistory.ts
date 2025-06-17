import { useGetChatsByPluginId } from "@/providers/plugin_generator";
import { Message } from "@/types/plugins.types";
import { useEffect, useState } from "react";

export const useChatHistory = (pluginId: string) => {
	const { data, isLoading: loadingChats } = useGetChatsByPluginId(pluginId);
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (data?.chat) {
			const mappedMessages: Message[] = data.chat.map((msg) => ({
				role: msg.sender === "user" ? "user" : "assistant",
				content: msg.content,
				timestamp: msg.timestamp,
			}));
			setMessages(mappedMessages);
		}
	}, [data?.chat]);

	return {
		messages,
		setMessages,
		loadingChats,
		lastCode: data?.lastCode || null, // Pass the lastCode to the component
	};
};
