// app/dashboard/page.tsx
import { getUserSessionCookie } from "@/utils/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientDashboard from "./_components/ClientDashboard";

export default async function Dashboard() {
	const session = await getUserSessionCookie(await cookies());
	if (!session) {
		redirect("/auth");
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300">
			<ClientDashboard />
		</div>
	);
}
