declare global {
	namespace NodeJS {
		interface ProcessEnv {
			APP_NAME: string;
			SESSION_COOKIE_NAME: string;
			SESSION_COOKIE_PASSWORD: string;
			V1_API_ENDPOINT: string;
			NEXT_PUBLIC_FRONTEND_URL: string;
			NEXT_PUBLIC_WEBSOCKET_URL: string;
		}
	}
}

export {};
