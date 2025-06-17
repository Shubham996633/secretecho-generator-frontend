import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RETURN_TO_URL_PARAM_NAME } from "./config/constants";

import { T_SEResponse } from "./types/request_response.types";
import { UserInfoResponse } from "./types/user.types";
import { getHeadersForBackendCall } from "./utils/api";
import { getReturnToUrlAfterAuth } from "./utils/auth";
import { getUserSessionCookie } from "./utils/session";

// This function can be marked `async` if using `await` inside
export const middleware = async (request: NextRequest) => {
	const res = NextResponse.next();

	// Check if the request URL path is "/"
	if (request.nextUrl.pathname === "/") {
		return res;
	}
	const session = await getUserSessionCookie(await cookies());

	// Allow access to companions only if the user is logged in or the user has an AccessToken
	if (session && session.user && session.user?.token?.trim().length >= 1) {
		if (request.nextUrl.pathname.startsWith("/unauthenticated")) {
			return res;
		}

		if (request.nextUrl.pathname.startsWith("/auth")) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		// check if authenticated
		const activeUser = await fetch(process.env.V1_API_ENDPOINT + "/users/me", {
			headers: getHeadersForBackendCall(session),
		});

		const activeUserJSON: T_SEResponse<UserInfoResponse> = await activeUser.json();

		if (!activeUserJSON?.success) {
			const unAuthenticatedUserPath =
				"/unauthenticated?" +
				RETURN_TO_URL_PARAM_NAME +
				"=" +
				encodeURIComponent(request.nextUrl.basePath + request.nextUrl.pathname + request.nextUrl.search);
			return NextResponse.redirect(new URL(unAuthenticatedUserPath, request.url));
		}

		return res;
	}

	if (request.nextUrl.pathname.startsWith("/auth")) {
		return res;
	}

	const returnToUrl = getReturnToUrlAfterAuth(request.nextUrl);
	if (!returnToUrl.success || !returnToUrl.data) {
		return NextResponse.redirect(new URL("/404", request.url));
	}

	return NextResponse.redirect(new URL(returnToUrl.data, request.url));
};

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - 404 page
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|404|favicon.ico).*)",
	],
};
