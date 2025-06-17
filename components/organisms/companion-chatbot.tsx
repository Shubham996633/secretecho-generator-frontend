"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { companions } from "@/config/companions";
import { useWebSocketContext } from "@/context/webSocketContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CompanionChatbot = () => {
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const searchParams = useSearchParams();
	const companionCode = searchParams.get("companion_code");
	const { client, connected, connect, disconnect } = useWebSocketContext();
	const { messages, setMessages, loadingChats } = useChatHistory(companionCode);
	const setMessageRef = useRef<typeof setMessages>(setMessages);

	useEffect(() => {
		setMessageRef.current = setMessages;
	}, [setMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (!companionCode || !client || loadingChats) return;

		connect();
		return () => {
			disconnect();
		};
	}, [client, connect, disconnect, companionCode, loadingChats]);

	// Handle WebSocket messages separately
	useEffect(() => {
		if (!companionCode && !setMessageRef.current) return;

		const handleMessage = (data: { response: string }) => {
			const aiMessage = {
				role: "assistant" as const,
				content: data.response,
				timestamp: new Date().toISOString(),
			};

			// Update local messages state
			setMessageRef.current((prev) => [...prev, aiMessage]);
		};

		client.on("message", handleMessage);

		return () => {
			client.off("message", handleMessage);
		};
	}, [client, companionCode]);

	const handleSendMessage = async () => {
		if (!input.trim() || !connected || !companionCode) return;

		const message = {
			role: "user" as const,
			content: input,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, message]);

		client.send({ message: input });

		setInput("");
	};

	const companion = companionCode ? companions.find((c) => c.companion_code === companionCode) : null;

	if (loadingChats) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
			</div>
		);
	}

	if (!companionCode || !companion) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 flex items-center justify-center">
				<Card className="p-6 bg-white/80">
					<CardTitle className="text-red-500">Invalid companion code or companion not found</CardTitle>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
			<div className="container mx-auto px-4 py-12">
				<Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl">
					<CardHeader>
						<div className="flex items-center gap-4">
							<div className="relative w-16 h-16 rounded-full overflow-hidden">
								<Image
									src={companion.avatarUrl}
									alt={`${companion.name} avatar`}
									height={50}
									width={50}
									className="object-cover rounded-full"
								/>
							</div>
							<div>
								<CardTitle className="text-2xl text-indigo-900">{companion.name}</CardTitle>
								<p className="text-gray-600">{companion.description}</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="h-[60vh] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
							{messages.map((msg, index) => (
								<div key={index} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
									<div
										className={`inline-block p-3 rounded-lg ${
											msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
										}`}
									>
										{msg.content}
									</div>
									<p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
						<div className="flex gap-2">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Type your message..."
								onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
								className="flex-1"
								disabled={!connected}
							/>
							<Button
								onClick={handleSendMessage}
								className="bg-indigo-600 cursor-pointer hover:bg-indigo-700"
								disabled={!connected}
							>
								<Send className="w-5 h-5" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default CompanionChatbot;
