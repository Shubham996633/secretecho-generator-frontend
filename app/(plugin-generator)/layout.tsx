import { Navbar } from "@/components/organisms/navbar";
import { UserProvider } from "@/context/userContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserProvider>
			<main className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-200 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300">
				<Navbar />
				<div className="container mx-auto px-4 py-6">{children}</div>
			</main>
		</UserProvider>
	);
};

export default DashboardLayout;
