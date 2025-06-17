"use client";

import LoginForm from "@/components/organisms/login-form";
import SignupForm from "@/components/organisms/signup-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthImage from "../../public/img-login.svg";
import logo from "../../public/logo.png";

export default function AuthPage() {
	const searchParams = useSearchParams();
	const action = searchParams?.get("action");
	const router = useRouter();

	const [isLogin, setIsLogin] = useState(action && action === "signup" ? false : true);

	useEffect(() => {
		if (action === "signup") {
			setIsLogin(false);
		}
	}, [action]);

	const handleLoginButtonClick = () => {
		setIsLogin(true);
		const params = new URLSearchParams(searchParams.toString());
		params.set("action", "login");
		router.push(`?${params.toString()}`);
	};

	const handleSignupButtonClick = () => {
		setIsLogin(false);
		const params = new URLSearchParams(searchParams.toString());
		params.set("action", "signup");
		router.push(`?${params.toString()}`);
	};

	return (
		<>
			<nav className="px-4 py-3 border-b-1 border-purple-700/90 dark:border-purple-300/90 flex justify-between items-center">
				<Link
					href={"/"}
					className="text-3xl flex flex-row  font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400"
				>
					<Image src={logo} className="mx-1" height={30} width={36} alt="logo" />
					Plugin Generator
				</Link>
			</nav>
			<div className="flex items-center justify-center  transition-all ease-in-out">
				<div className="container mx-auto px-4 max-w-screen-xl flex flex-col lg:flex-row items-center gap-12 py-5">
					{/* Left: Hero Section */}
					<div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
						<h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 dark:text-indigo-200 leading-tight">
							Your Plugin Generator Await
						</h1>
						<p className="text-lg text-gray-700 dark:text-gray-300 max-w-md leading-relaxed">
							Dive into get ready to build plugins for your <br /> e-commerce in just seconds as per your ask.
						</p>
						<div className="relative w-full max-w-lg h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
							<Image
								src={AuthImage}
								alt="Plugin Generator Interface"
								fill
								className="object-cover"
								priority
								quality={85}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
							<p className="absolute bottom-4 left-4 text-white dark:text-gray-200 text-sm font-semibold">
								Powered by Gemini AI technology
							</p>
						</div>
					</div>

					{/* Right: Auth Form */}
					<div className="lg:w-1/2 flex justify-center">
						<Card className="w-full max-w-md px-4 py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl border border-gray-100 dark:border-gray-700">
							<CardHeader className="space-y-2">
								<CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
									{!isLogin ? "Join AICompanion" : "Welcome Back"}
								</CardTitle>
								<CardDescription className="text-center text-gray-600 dark:text-gray-400">
									{!isLogin ? "Create an account to start chatting." : "Log in to connect with your Plugin Generators."}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!isLogin ? <SignupForm /> : <LoginForm />}
								<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
									{!isLogin ? "Already have an account?" : "Need an account?"}
									<Button
										variant="link"
										onClick={isLogin ? handleSignupButtonClick : handleLoginButtonClick}
										className="text-indigo-600 cursor-pointer dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
									>
										{!isLogin ? "Log In" : "Sign Up"}
									</Button>
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
