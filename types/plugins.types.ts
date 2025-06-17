// types/plugins.types.ts

// Chat message as stored in the database
export type ChatMessage = {
	content: string;
	sender: "user" | "plugin_generator";
	timestamp: string; // We'll convert Date to string on the frontend
};

// Response type for chat history with last code
export type ChatHistoryResponse = {
	chat: ChatMessage[];
	lastCode: string | null; // The most recent code message, if any
};

// Plugin generator session
export type PluginGenerator = {
	pluginId: string; // Unique identifier for the plugin session
	pluginName: string; // Display name for the plugin
	isFinal: boolean; // Indicates if the plugin is finalized
};

// Request to create a new plugin generator session
export type CreatePluginGeneratorRequest = {
	pluginName: string; // Name of the plugin session
};

// Response from creating a plugin generator session
export type CreatePluginGeneratorResponse = {
	pluginId: string;
	pluginName: string;
};

// Message type for display in the UI
export type Message = {
	role: "user" | "assistant";
	content: string;
	timestamp: string;
	isLoading?: boolean;
	avatar?: string;
	type?: "chat" | "code";
};

// WebSocket message structure
export type WebSocketMessage = {
	type: "chat" | "code";
	response: string;
	sender?: "user" | "plugin_generator";
	isFinal?: boolean;
};
