"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { Skeleton } from "@/components/ui/skeleton";
import { frontendAxios } from "@/config/axios";
import { RETURN_TO_URL_PARAM_NAME } from "@/config/constants";
import { ModeToggle } from "@/context/themeButton";
import { useUserContext } from "@/context/userContext";
import { T_SEResponse } from "@/types/request_response.types";
import { AxiosResponse } from "axios";
import { Loader2, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "../../public/logo.png";
import { SignOutModal } from "./signout-model";
export function Navbar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { userData } = useUserContext();
	const [currentUserData, setCurrentUserData] = useState(userData);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [open, setOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		setCurrentUserData(userData);
	}, [userData]);

	const handleLogout = async () => {
		setIsLoggingOut(true);

		const logoutPromise = frontendAxios.post<AxiosResponse<T_SEResponse<undefined>>>("/auth/logout");

		toast.promise(logoutPromise, {
			loading: "Logging out...",
			success: () => {
				const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
				const returnToParam = encodeURIComponent(currentPath);
				const authPath = `/auth?${RETURN_TO_URL_PARAM_NAME}=${returnToParam}`;
				router.push(authPath);
				setOpen(false);
				setIsMobileMenuOpen(false);
				return "Logged out successfully!";
			},
			error: (error: Error) => {
				console.error("Logout failed:", error);
				setIsLoggingOut(false);
				setOpen(false);
				return error.message || "Failed to log out. Please try again.";
			},
		});
	};

	const getInitials = (firstName?: string, lastName?: string) => {
		const firstInitial = firstName ? firstName.charAt(0) : "";
		const lastInitial = lastName ? lastName.charAt(0) : "";
		return `${firstInitial}${lastInitial}`;
	};

	const fullName = currentUserData ? `${currentUserData.first_name} ${currentUserData.last_name}` : "Guest";

	return (
		<>
			<nav className="fixed top-0 left-0 right-0 z-50 border-b-1 border-purple-700/90 dark:border-purple-300/90 shadow-lg bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					{/* Logo (Left) */}
					<Link
						href={currentUserData ? "/dashboard" : "/"}
						className="text-3xl flex flex-row font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400"
					>
						<Image src={logo} className="mx-1" height={30} width={36} alt="" />
						Plugin Generator
					</Link>

					{/* Right: Desktop Menu + Hamburger (Mobile) */}
					<div className="flex items-center space-x-6">
						<div className="hidden md:flex items-center space-x-6">
							<ModeToggle />
							{currentUserData ? (
								<Menubar className="border-purple-700/90 dark:border-purple-300/90">
									<MenubarMenu>
										<MenubarTrigger className="h-9 cursor-pointer" tabIndex={0}>
											<Avatar className="text-xl size-9 font-bold">
												<div className="pt-1">{getInitials(currentUserData.first_name, currentUserData.last_name)}</div>
											</Avatar>
										</MenubarTrigger>
										<MenubarContent align="center" className="w-[200px] border-purple-700/90 dark:border-purple-300/90">
											<MenubarItem className="">{fullName}</MenubarItem>
											<MenubarSeparator />
											<MenubarItem className="">{currentUserData.email}</MenubarItem>
											<MenubarSeparator />
											<MenubarItem>
												<Button
													variant="default"
													className="gap-3 w-full bg-background/90 border-2 cursor-pointer text-black dark:text-white hover:bg-background hover:dark:bg-background"
													onClick={() => setOpen(true)}
													disabled={isLoggingOut}
												>
													{isLoggingOut ? (
														<Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
													) : (
														<LogOut className="w-5 h-5 text-black dark:text-white" />
													)}
													{isLoggingOut ? "Logging out..." : "Logout"}
												</Button>
											</MenubarItem>
										</MenubarContent>
									</MenubarMenu>
								</Menubar>
							) : (
								<Skeleton className="h-12 w-12 rounded-full" />
							)}
						</div>
						<Button
							variant="ghost"
							className="md:hidden p-2"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
						>
							<svg
								className="w-6 h-6 text-black dark:text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
								/>
							</svg>
						</Button>
					</div>

					<SignOutModal
						isOpen={open}
						isLoggingOut={isLoggingOut}
						onClose={() => setOpen(false)}
						onConfirm={handleLogout}
					/>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden bg-white dark:bg-gray-900 border-t border-purple-700/90 dark:border-purple-300/90">
						<div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
							{currentUserData ? (
								<>
									<div className="flex items-center gap-4">
										<Avatar className="text-xl size-9 font-bold">
											<div className="pt-1">{getInitials(currentUserData.first_name, currentUserData.last_name)}</div>
										</Avatar>
										<div>
											<p className="text-indigo-900 dark:text-indigo-200 font-semibold">{fullName}</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">{currentUserData.email}</p>
										</div>
									</div>
									<Button
										variant="default"
										className="gap-3 w-full bg-background/90 border-2 cursor-pointer text-black dark:text-white hover:bg-background hover:dark:bg-background"
										onClick={() => setOpen(true)}
										disabled={isLoggingOut}
									>
										{isLoggingOut ? (
											<Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
										) : (
											<LogOut className="w-5 h-5 text-black dark:text-white" />
										)}
										{isLoggingOut ? "Logging out..." : "Logout"}
									</Button>
								</>
							) : (
								<Skeleton className="h-12 w-12 rounded-full" />
							)}
							<div className="flex justify-start">
								<ModeToggle />
							</div>
						</div>
					</div>
				)}
			</nav>
			{/* Spacer to prevent content from being hidden under the fixed navbar */}
			<div className="h-[80px]"></div>
		</>
	);
}
