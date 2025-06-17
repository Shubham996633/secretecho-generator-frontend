"use client";
import { useTheme } from "next-themes";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
	const { setTheme } = useTheme();
	setTheme("dark");
	return <main className=" ">{children}</main>;
};

export default LandingLayout;
