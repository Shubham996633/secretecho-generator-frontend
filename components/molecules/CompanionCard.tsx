import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Companion } from "@/config/companions";
import { Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";

interface CompanionCardProps {
	companion: Companion;
	onCreateCompanion: (companion: Companion) => void;
	isLoading: boolean;
}

export default function CompanionCard({ companion, onCreateCompanion, isLoading }: CompanionCardProps) {
	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-purple-700/90 dark:border-purple-300/90 rounded-xl overflow-hidden">
			<CardHeader className="p-4">
				<div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-indigo-600 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900">
					<Image src={companion.avatarUrl} alt={`${companion.name} avatar`} fill className="object-cover" />
				</div>
				<CardTitle className="text-center text-xl text-indigo-900 dark:text-indigo-200 mt-4 -mb-5">
					{companion.name}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 py-1 text-center">
				<p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">{companion.description}</p>
				<Button
					className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 text-lg font-semibold transition-colors duration-200"
					onClick={() => onCreateCompanion(companion)}
					disabled={isLoading}
				>
					<MessageCircle className="w-5 h-5 mr-2" />
					{isLoading ? (
						<span className="flex flex-row gap-1">
							Launching
							<Loader2 className="animate-spin mt-2 font-black" />
						</span>
					) : (
						"Chat Now"
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
