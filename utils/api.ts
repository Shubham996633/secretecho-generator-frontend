
import { T_UserSessionData } from "@/common/types/session.types";
import { AxiosHeaders } from "axios";

export const getHeadersForBackendCall = (session?: T_UserSessionData): AxiosHeaders | undefined => {
	if (!session || !session.user || session.user.token?.trim().length <= 0) {
		return undefined;
	}

	const headers = new AxiosHeaders();
	headers.set("Authorization", `Bearer ${session.user.token}`);

	return headers;
};
