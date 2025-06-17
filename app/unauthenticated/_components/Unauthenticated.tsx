"use client";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Head from "next/head";

const UnAuthenticated = () => {
	return (
		<>
			<Head>
				<title>SecretEcho - Plugin Generator</title>
				<meta name="description" content="UnAuthenticated Page" />
				<meta name="viewport" content="width-device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.png" />
			</Head>
			<div className="h-full pt-52 flex flex-col items-center justify-center space-y-4">
				<Image src="/error.png" height="400" width="400" alt="UnAuthenticated" className="block dark:hidden" />

				<Image src="/error-dark.png" height="400" width="400" className="hidden dark:block" alt="UnAuthenticated" />
				<h2 className="text-xl font-medium">You got Un-Authenticated , Redirecting to Auth Screen!</h2>
				<Button asChild>
					<Link href="/dashboard">Go back</Link>
				</Button>
			</div>
		</>
	);
};

export default UnAuthenticated;
