import { T_UserSessionData } from "@/common/types/session.types";
import { T_SEResponse } from "@/types/request_response.types";
import { SignupWithPasswordRequest, SignUpWithPasswordResponse } from "@/types/user.types";
import { setUserSessionCookie } from "@/utils/session";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const userSignInApi = async (req: NextRequest) => {
	try {
		let body = {};
		if (req.body) {
			body = await req.json();
		}

		const response = await axios.post<
			SignupWithPasswordRequest,
			AxiosResponse<T_SEResponse<SignUpWithPasswordResponse>>
		>(process.env.V1_API_ENDPOINT + "/auth/signup", body);

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

		if (responseData.success && responseData.data) {
			const cookieJar = cookies();

			// Create iron session
			const session: T_UserSessionData = {
				user: {
					email: responseData?.data?.email,
					token: responseData?.data?.token,
				},
			};

			await setUserSessionCookie(await cookieJar, session);
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

export const POST = userSignInApi;
