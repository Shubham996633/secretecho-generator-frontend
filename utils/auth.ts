import { RETURN_TO_URL_PARAM_NAME } from "@/config/constants";
import { T_SEResponse } from "@/types/request_response.types";

export const getReturnToUrlAfterAuth = (returnToUrl: URL | undefined): T_SEResponse<string> => {
	if (!returnToUrl)
		return {
			success: true,
			errors: [],
			data: "/auth",
		};

	return {
		success: true,
		errors: [],
		data: "/auth?" + RETURN_TO_URL_PARAM_NAME + "=" + encodeURIComponent(returnToUrl.pathname + returnToUrl.search),
	};
};
