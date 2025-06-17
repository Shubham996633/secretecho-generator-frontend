export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 ">
			{children}
		</div>
	);
}
