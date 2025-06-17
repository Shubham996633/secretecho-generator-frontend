/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { frontendAxios } from "@/config/axios";
import { useWebSocketContext } from "@/context/webSocketContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import useChatStore from "@/hooks/useChatStore";
import { useGetPluginGenerators } from "@/providers/plugin_generator";
import { Message, WebSocketMessage } from "@/types/plugins.types";
import Editor from "@monaco-editor/react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Clipboard, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function PluginGeneratorEditor({ pluginId }: { pluginId: string }) {
	const { data: pluginSessions, isFetching: loadingSessions } = useGetPluginGenerators();
	const { messages, setMessages, loadingChats, lastCode } = useChatHistory(pluginId);
	const { client, connected, connect } = useWebSocketContext();
	const queryClient = useQueryClient();
	const currentPlugin = pluginSessions?.find((session) => session.pluginId === pluginId);
	const { input, setInput, handleInputChange, isGenerating, setIsGenerating } = useChatStore();
	const [code, setCode] = useState(lastCode || "");
	const [isFinal, setIsFinal] = useState(currentPlugin?.isFinal || false);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	// Sync isFinal with currentPlugin.isFinal when plugin changes
	useEffect(() => {
		setIsFinal(currentPlugin?.isFinal || false);
	}, [currentPlugin]);

	// Connect to WebSocket on mount and handle WebSocket messages
	useEffect(() => {
		if (!connected) {
			connect();
		}

		const onMessage = (data: WebSocketMessage) => {
			if (data.type === "chat") {
				const newMessage: Message = {
					role: data.sender === "user" ? "user" : "assistant",
					content: data.response,
					timestamp: new Date().toISOString(),
					type: "chat", // Add type field
				};
				setMessages([...messages, newMessage]);
			} else if (data.type === "code") {
				const cleanedCode = data.response
					.replace(/```php\n|```/g, "")
					.replace(/\\n/g, "\n")
					.trim();
				console.log("Received new code:", cleanedCode);
				setCode(cleanedCode);
				setIsFinal(data.isFinal || false);
				if (data.isFinal) {
					queryClient.invalidateQueries({ queryKey: ["pluginGenerators"] });
				}
			}
			setIsGenerating(false);
		};

		client.on("message", onMessage);
		return () => {
			client.off("message", onMessage);
		};
	}, [client, connected, connect, messages, setMessages, setIsGenerating, queryClient]);

	// Update code when lastCode or pluginId changes
	useEffect(() => {
		console.log("lastCode updated:", lastCode);
		setCode(lastCode || "");
	}, [lastCode, pluginId]);

	// Auto-scroll on initial chat load and when messages update
	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTo({
				top: messagesContainerRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages, loadingChats]);

	const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input || !connected || isFinal || currentPlugin?.isFinal) return;

		const userMessage: Message = {
			role: "user",
			content: input,
			timestamp: new Date().toISOString(),
			type: "chat", // Add type field
		};
		setMessages([...messages, userMessage]);
		setInput("");
		setIsGenerating(true);

		try {
			client.send({ message: input, pluginId });
		} catch (error) {
			toast("Failed to send message.");
			setIsGenerating(false);
		}
	};

	const handleFinalize = async () => {
		if (!connected) return;
		setIsGenerating(true);
		try {
			client.send({ message: "Finalize", pluginId });
			setIsFinal(true);
			await queryClient.invalidateQueries({ queryKey: ["pluginGenerators"] });
		} catch (error) {
			toast("Failed to finalize plugin or sync with server.");
			setIsFinal(false);
			setIsGenerating(false);
		}
	};

	const handleSavePlugin = async () => {
		try {
			await frontendAxios.post("/plugin/plugin-generator/save-plugin", {
				pluginId,
				generatedPlugin: code,
			});
			toast("Plugin saved successfully!");
		} catch (error) {
			toast("Failed to save plugin.");
		}
	};

	const handleDownload = () => {
		const blob = new Blob([code], { type: "text/php" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "custom-woocommerce-plugin.php";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		toast("Code copied to clipboard!");
	};

	const handlePluginSelect = (selectedPluginId: string) => {
		router.push(`/chat?plugin_id=${selectedPluginId}`);
		setMessages([]);
		setCode("");
		setIsFinal(false);
		queryClient.invalidateQueries({ queryKey: ["chatHistory", selectedPluginId] });
	};

	// Filter messages to only show chat messages
	const chatMessages = messages.filter((msg) => !msg.content.startsWith("<?php"));
	console.log(chatMessages);

	return (
		<div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row gap-6">
			{/* Sidebar: Plugin Sessions List (Smaller) */}
			<div className="lg:w-1/5 w-full">
				<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-purple-700/90 dark:border-purple-300/90 rounded-xl h-full">
					<CardHeader className="p-4">
						<CardTitle className="text-lg text-indigo-900 dark:text-indigo-200">Plugin Sessions</CardTitle>
					</CardHeader>
					<CardContent className="p-4 space-y-2 overflow-y-auto max-h-[80vh]">
						{loadingSessions ? (
							<div className="flex items-center justify-center">
								<Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
							</div>
						) : pluginSessions?.length === 0 ? (
							<p className="text-gray-600 dark:text-gray-300 text-sm">No plugin sessions found.</p>
						) : (
							pluginSessions?.map((session) => (
								<motion.div
									key={session.pluginId}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
										pluginId === session.pluginId
											? "bg-indigo-100 dark:bg-indigo-900/50"
											: session.isFinal
											? "bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50"
											: "hover:bg-indigo-50 dark:hover:bg-gray-700/50"
									}`}
									onClick={() => handlePluginSelect(session.pluginId)}
								>
									<div className="flex-1 min-w-0">
										<p className="text-indigo-900 dark:text-indigo-200 font-medium text-sm truncate">
											{session.pluginName}
										</p>
										<p className="text-gray-600 dark:text-gray-300 text-xs">
											{session.isFinal ? "Finalized" : "In Progress"}
										</p>
									</div>
									{session.isFinal && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
								</motion.div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			{/* Main Editor Area */}
			<div className="lg:w-4/5 w-full">
				{loadingChats || !currentPlugin ? (
					<Card className="p-6 bg-white/80 dark:bg-gray-800/80 h-[85vh] flex items-center justify-center">
						<CardTitle className="text-red-500 dark:text-red-400 text-center">
							{loadingChats ? "Loading chat..." : "Select a plugin session to start generating"}
						</CardTitle>
					</Card>
				) : (
					<Card className="bg-white/80 rounded-2xl dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-purple-700/90 dark:border-purple-300/90 h-[85vh]">
						<CardHeader className="p-4">
							<CardTitle className="text-xl text-indigo-900 dark:text-indigo-200">{currentPlugin.pluginName}</CardTitle>
						</CardHeader>
						<CardContent className="p-4 -mt-9">
							<div className="flex flex-col lg:flex-row gap-4 h-[70vh]">
								{/* Messages Panel (Left Side, Larger with Code Editor Background) */}
								<div className="lg:w-3/5 w-full flex flex-col">
									<div
										className="flex-1 bg-[#1e1e1e] dark:bg-[#1e1e1e] rounded-lg overflow-y-auto p-5 mb-4 relative"
										style={{
											backgroundImage: "url('https://www.monaco-editor.dev/images/code-bg.png')",
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									>
										<div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg"></div>
										{chatMessages.length === 0 ? (
											<p className="text-gray-400 dark:text-gray-400 relative z-10">
												No messages yet. Start by sending a plugin request!
											</p>
										) : (
											<div ref={messagesContainerRef} className="flex flex-col gap-3 relative z-10">
												{chatMessages.map((message, index) => (
													<div
														key={index}
														className={`p-3 rounded-lg shadow-md ${
															message.role === "user"
																? "bg-indigo-600/80 text-white self-end"
																: "bg-gray-800/80 text-gray-200 self-start"
														} max-w-[85%] border border-purple-700/50 dark:border-purple-300/50`}
													>
														{message.content}
													</div>
												))}
											</div>
										)}
									</div>
									{/* Input Area */}
									<form onSubmit={handleSendMessage} className="flex gap-2">
										<Input
											placeholder="e.g., Change the add to cart button to blue"
											value={input}
											onChange={handleInputChange}
											className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-purple-700/90 dark:border-purple-300/90"
											disabled={isFinal || currentPlugin.isFinal}
										/>
										<Button
											type="submit"
											disabled={isGenerating || !connected || !input || isFinal || currentPlugin.isFinal}
											className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
										>
											{isGenerating ? "Generating..." : "Generate"}
										</Button>
									</form>
								</div>

								{/* Code Editor Panel (Right Side, Larger) */}
								<div className="lg:w-2/5 w-full flex flex-col">
									{code ? (
										<>
											{/* Editor Toolbar */}
											<div className="flex gap-2 mb-2">
												<Button
													onClick={handleCopy}
													className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white flex items-center gap-2 text-sm"
												>
													<Clipboard className="w-4 h-4" /> Copy
												</Button>
												<Button
													onClick={handleDownload}
													className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white flex items-center gap-2 text-sm"
												>
													<Download className="w-4 h-4" /> Download
												</Button>
												<Button
													onClick={handleFinalize}
													disabled={isFinal || isGenerating || currentPlugin.isFinal}
													className={`flex items-center gap-2 text-sm ${
														isFinal || currentPlugin.isFinal
															? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
															: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
													}`}
												>
													{isFinal || currentPlugin.isFinal ? (
														<>
															<Check className="w-4 h-4" /> Finalized
														</>
													) : (
														"Finalize"
													)}
												</Button>
												<Button
													onClick={handleSavePlugin}
													className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm"
												>
													Save Plugin
												</Button>
											</div>
											{/* Code Editor */}
											<div className="flex-1 border rounded-lg overflow-hidden">
												<Editor
													key={code}
													height="100%"
													defaultLanguage="php"
													theme="vs-dark"
													value={code}
													options={{
														readOnly: true,
														minimap: { enabled: false },
														scrollBeyondLastLine: false,
														fontSize: 14,
														lineNumbers: "on",
													}}
												/>
											</div>
										</>
									) : (
										<div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
											<p className="text-gray-600 dark:text-gray-300">Generate a plugin to see the code here.</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
