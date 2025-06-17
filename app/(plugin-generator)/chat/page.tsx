// app/companion/chat/page.tsx
import { getUserSessionCookie } from "@/utils/session";
import { cookies } from "next/headers";
import ClientPluginEditor from "./ClientChatWrapper";

// Define the props type to match Next.js App Router expectations
interface ChatPageProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
	// Await the searchParams Promise to resolve the actual search parameters
	const resolvedSearchParams = await searchParams;
	const pluginId = typeof resolvedSearchParams?.plugin_id === "string" ? resolvedSearchParams.plugin_id : undefined;

	if (!pluginId) {
		throw new Error("Plugin ID is required");
	}

	// Get session token
	const session = await getUserSessionCookie(await cookies());
	if (!session) {
		throw new Error("User session not found");
	}
	const token = session?.user?.token;

	// Base WebSocket URL from environment variable or fallback
	const baseWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;

	// Construct WebSocket URL with plugin_id and token
	const queryParams = [];
	if (pluginId) {
		queryParams.push(`plugin_id=${pluginId}`);
	}
	if (token) {
		queryParams.push(`token=${encodeURIComponent(token)}`);
	}
	const wsUrl = queryParams.length > 0 ? `${baseWsUrl}?${queryParams.join("&")}` : baseWsUrl;

	return <ClientPluginEditor url={wsUrl} pluginId={pluginId} />;
}
