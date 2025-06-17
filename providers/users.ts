import { frontendAxios } from "@/config/axios";
import { T_SEResponse } from "@/types/request_response.types";
import { UserInfoResponse } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Fetches user information from the /users/me endpoint.
 * @param axiosInstance The Axios instance to use for the request.
 * @returns A promise that resolves to the user information.
 * @throws Error if the request fails or the response is invalid.
 */
export const fetchUserInfo = async (axiosInstance: AxiosInstance): Promise<UserInfoResponse> => {
	try {
		const response = await axiosInstance.get<null, AxiosResponse<T_SEResponse<UserInfoResponse>>>("/users/me");
		if (!response.data.success) {
			throw new Error(response.data.errors?.[0] || "Failed to fetch user information");
		}
		if (!response.data.data) {
			throw new Error("No user data returned");
		}
		return response.data.data;
	} catch (err) {
		throw new Error(`Error fetching user information: ${err instanceof Error ? err.message : "Unknown error"}`);
	}
};

/**
 * Hook to fetch user information using React Query.
 * @param enabled Whether to enable the query (e.g., based on authentication status).
 * @param initialData Optional initial data for the user.
 * @returns A React Query instance to manage the user information.
 */
export const useUserInfo = (enabled: boolean = true, initialData?: UserInfoResponse) => {
	return useQuery<UserInfoResponse, Error>({
		queryKey: ["userInfo"],
		queryFn: () => fetchUserInfo(frontendAxios),
		enabled,
		initialData,
	});
};
