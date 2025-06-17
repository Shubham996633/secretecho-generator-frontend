// app/companion/chat/ClientPluginEditor.tsx
"use client";

import PluginGeneratorEditor from "@/components/PluginGeneratorEditor";
import { WebSocketProvider } from "@/context/webSocketContext";

interface ClientPluginEditorProps {
	url: string;
	pluginId: string;
}

export default function ClientPluginEditor({ url, pluginId }: ClientPluginEditorProps) {
	return (
		<WebSocketProvider url={url}>
			<PluginGeneratorEditor pluginId={pluginId} />
		</WebSocketProvider>
	);
}
