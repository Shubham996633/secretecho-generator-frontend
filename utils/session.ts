import { T_UserSessionData } from "@/common/types/session.types";
import { IronSessionOptions } from "iron-session";
import { sealData, unsealData } from "iron-session/edge";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const getSessionCookieConfig = (): IronSessionOptions => {
	return {
		cookieName: process.env.SESSION_COOKIE_NAME,
		password: process.env.SESSION_COOKIE_PASSWORD,
		// secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
		cookieOptions: {
			secure: process.env.NODE_ENV === "production",
		},
	};
};

/**
 * Called to extract the session cookie from the cookie jar.
 * @param cookies The cookie jar
 * @returns T_UserSessionData or null
 */
export async function getUserSessionCookie(cookies: ReadonlyRequestCookies): Promise<T_UserSessionData | null> {
	const cookieConfig = getSessionCookieConfig();

	const found = cookies.get(cookieConfig.cookieName);

	if (!found) return null;

	const sessionData = await unsealData<T_UserSessionData>(found.value, {
		password: cookieConfig.password,
	});

	return sessionData ?? null;
}

/**
 * Used to set cookies in the cookie jar.
 * @param cookies ReadonlyRequestCookies
 */
export async function setUserSessionCookie(cookies: ReadonlyRequestCookies, sessionData: T_UserSessionData) {
	const encryptedSession = await sealData(sessionData, {
		password: process.env.SESSION_COOKIE_PASSWORD,
	});

	// set the cookie
	cookies.set(process.env.SESSION_COOKIE_NAME, encryptedSession);
}

/**
 * Used to delete cookies in the cookie jar.
 * @param cookies ReadonlyRequestCookies
 */
export function deleteUserSessionCookie(cookies: ReadonlyRequestCookies) {
	// delete the cookie
	cookies.delete(process.env.SESSION_COOKIE_NAME);
}
