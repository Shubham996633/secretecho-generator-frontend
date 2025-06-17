"use client";

import { frontendAxios } from "@/config/axios";
import { RETURN_TO_URL_PARAM_NAME } from "@/config/constants";
import { T_SEResponse } from "@/types/request_response.types";
import { AxiosResponse } from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import UnAuthenticated from "./_components/Unauthenticated";

const UnauthenticatedPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const routerRef = useRef(router);
	const pathnameRef = useRef<string | null>(pathname);
	const searchParamRef = useRef<ReturnType<typeof useSearchParams>>(searchParams);

	useEffect(() => {
		routerRef.current = router;
		pathnameRef.current = pathname;
		searchParamRef.current = searchParams;
	}, [router, pathname, searchParams]);

	useEffect(() => {
		(async () => {
			try {
				await frontendAxios.post<AxiosResponse<T_SEResponse<undefined>>>("/auth/logout");
				const currentPath =
					pathnameRef.current + (searchParamRef.current?.toString() ? `?${searchParamRef.current.toString()}` : "");

				// Encode the full path (pathname + search)
				const returnToParam = encodeURIComponent(currentPath);
				const authPath = `/auth?${RETURN_TO_URL_PARAM_NAME}=${returnToParam}`;
				routerRef.current.push(authPath);
				routerRef.current.refresh();
			} catch (error) {
				console.error("Logout failed:", error);
				// Optionally redirect to /auth without returnToParam on error
				routerRef.current.push("/auth");
				routerRef.current.refresh();
			}
		})();
	}, []);

	return (
		<>
			<UnAuthenticated />
		</>
	);
};

export default UnauthenticatedPage;
