"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserInfoResponse } from "@/types/user.types";
import { useUserInfo } from "@/providers/users";

// Define the context shape
interface UserContextType {
	userData: UserInfoResponse | null;
	isLoading: boolean;
	updateUserContext: (data: UserInfoResponse | null) => void;
	fetchDataExplicitly: () => Promise<void>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider props
interface UserProviderProps {
	children: ReactNode;
}

// User provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [userData, setUserData] = useState<UserInfoResponse | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { data: fetchedUserData, isLoading: queryLoading, refetch } = useUserInfo();

	// Sync fetched user data with context
	useEffect(() => {
		setUserData(fetchedUserData || null);
		setIsLoading(queryLoading);
	}, [fetchedUserData, queryLoading]);

	// Update user data in context
	const updateUserContext = (data: UserInfoResponse | null) => {
		setUserData(data);
		setIsLoading(false);
	};

	// Expose refetch function to be called explicitly
	const fetchDataExplicitly = async () => {
		try {
			await refetch();
		} catch {
			throw new Error("Error fetching data explicitly");
		}
	};

	// Context value
	const contextValue: UserContextType = {
		userData,
		isLoading,
		updateUserContext,
		fetchDataExplicitly,
	};

	return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// Custom hook to access the user context
export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
};