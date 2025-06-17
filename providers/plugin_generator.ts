// providers/plugin_generator.ts
import { frontendAxios } from "@/config/axios";
import {
	ChatHistoryResponse,
	ChatMessage,
	CreatePluginGeneratorRequest,
	CreatePluginGeneratorResponse,
	PluginGenerator,
} from "@/types/plugins.types";
import { T_SEResponse } from "@/types/request_response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Creates a new plugin generator session.
 * @param request The request containing the plugin name.
 * @param axiosInstance The Axios instance to use for the request.
 * @returns A promise that resolves to the creation response or null.
 * @throws Error if the request fails or the response is invalid.
 */
export const createPluginGenerator = async (
	request: CreatePluginGeneratorRequest,
	axiosInstance: AxiosInstance = frontendAxios
): Promise<CreatePluginGeneratorResponse | null> => {
	const response = await axiosInstance.post<
		CreatePluginGeneratorRequest,
		AxiosResponse<T_SEResponse<CreatePluginGeneratorResponse>>
	>("/plugin/plugin-generator", request);

	if (response.data.success !== true) {
		throw new Error(response.data.errors[0] || "Failed to create plugin generator session");
	}

	return response.data.data || null;
};

/**
 * Fetches chat history for a given plugin session.
 * @param axiosInstance The Axios instance to use for the request.
 * @param pluginId The plugin session ID to fetch chats for.
 * @returns A promise that resolves to an array of chat messages.
 * @throws Error if the request fails or the response is invalid.
 */
export const fetchChatByPluginId = async (
	axiosInstance: AxiosInstance,
	pluginId: string
): Promise<ChatHistoryResponse> => {
	try {
		const response = await axiosInstance.get<null, AxiosResponse<T_SEResponse<ChatHistoryResponse>>>(
			`/plugin/plugin-generator/chat-history`,
			{
				params: {
					plugin_id: pluginId,
				},
			}
		);
		if (!response.data.success) {
			throw new Error(response.data.errors[0] || "Failed to fetch chat history");
		}
		return response.data.data || { chat: [], lastCode: null };
	} catch (err) {
		throw new Error(`Error fetching chat history: ${err instanceof Error ? err.message : "Unknown error"}`);
	}
};

/**
 * Fetches all plugin generator sessions for the user.
 * @param axiosInstance The Axios instance to use for the request.
 * @returns A promise that resolves to an array of plugin generator sessions.
 * @throws Error if the request fails or the response is invalid.
 */
export const fetchPluginGenerators = async (
	axiosInstance: AxiosInstance = frontendAxios
): Promise<PluginGenerator[]> => {
	const response = await axiosInstance.get<null, AxiosResponse<T_SEResponse<PluginGenerator[]>>>(
		`/plugin/plugin-generators`
	);

	if (!response.data.success) {
		throw new Error(response.data.errors[0] || "Failed to fetch plugin generator sessions");
	}

	return response.data.data || [];
};

/**
 * Hook to fetch chat history for a plugin session using React Query.
 * @param pluginId The plugin session ID to fetch chats for.
 * @param initialData Optional initial data for the chats.
 * @returns A React Query instance to manage the chat history.
 */
export const useGetChatsByPluginId = (pluginId: string | null, initialData?: ChatMessage[]) => {
	return useQuery<ChatHistoryResponse, Error>({
		queryKey: ["chats", pluginId],
		queryFn: () => {
			if (!pluginId) {
				throw new Error("Plugin ID is required");
			}
			return fetchChatByPluginId(frontendAxios, pluginId);
		},
		enabled: !!pluginId,
		initialData: pluginId ? { chat: initialData || [], lastCode: null } : { chat: [], lastCode: null },
	});
};

/**
 * Hook to fetch all plugin generator sessions for the user.
 * @param initialData Optional initial data for the plugin sessions.
 * @returns A React Query instance to manage the plugin sessions.
 */
export const useGetPluginGenerators = (initialData?: PluginGenerator[]) => {
	return useQuery<PluginGenerator[], Error>({
		queryKey: ["pluginGenerators"],
		queryFn: () => fetchPluginGenerators(frontendAxios),
		initialData: initialData || [],
	});
};

/**
 * Hook to create a new plugin generator session using React Query.
 * @returns A React Query mutation instance to create a plugin generator session.
 */
export const useCreatePluginGenerator = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreatePluginGeneratorRequest) => createPluginGenerator(request, frontendAxios),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pluginGenerators"] });
		},
	});
};
