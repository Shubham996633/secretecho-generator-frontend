import { v1APIAxios } from "@/config/axios";
import { T_SEResponse } from "@/types/request_response.types";
import { getHeadersForBackendCall } from "@/utils/api";
import { deleteUserSessionCookie, getUserSessionCookie } from "@/utils/session";
import { AxiosResponse, isAxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userLogoutApi = async (req: NextRequest) => {
	try {
		const session = await getUserSessionCookie(await cookies());
		if (!session) {
			return new NextResponse(
				JSON.stringify({
					success: true,
					errors: [],
				}),
				{
					status: 200,
				}
			);
		}

		const headers = getHeadersForBackendCall(session);
		if (!headers) {
			return new NextResponse(
				JSON.stringify({
					success: true,
					errors: [],
				}),
				{
					status: 200,
				}
			);
		}

		const response = await v1APIAxios.post<undefined, AxiosResponse<T_SEResponse<undefined>>>(
			process.env.V1_API_ENDPOINT + "/auth/logout",
			undefined,
			{
				headers: headers,
			}
		);

		// Convert the axios response to Next.js response format
		const responseData = response.data;
		const status = response.status;

		// Set the response headers
		const responseHeaders = new Headers();
		Object.keys(response.headers).forEach((key) => {
			responseHeaders.set(key, response.headers[key]);
		});

		// Remove the "Transfer-Encoding" header
		responseHeaders.delete("Transfer-Encoding");
		responseHeaders.delete("Content-Length");

		if (responseData.success || response.status === 401) {
			// Delete session from cookie Jar
			const cookieJar = cookies();
			deleteUserSessionCookie(await cookieJar);

			return new NextResponse(
				JSON.stringify({
					success: true,
					data: response.data ?? undefined,
					errors: [],
				}),
				{
					status: 200,
				}
			);
		}

		// Send the response data back to the frontend
		return new NextResponse(JSON.stringify(responseData), {
			status: status,
			headers: responseHeaders,
		});
	} catch (error) {
		if (!isAxiosError(error)) {
			return new NextResponse(
				JSON.stringify({
					success: false,
					errors: ["some error occurred"],
				}),
				{
					status: 500,
				}
			).json();
		}

		return new NextResponse(JSON.stringify(error.response?.data ?? {}), {
			status: error.response?.status ?? 500,
		}).json();
	}
};

export const POST = userLogoutApi;
