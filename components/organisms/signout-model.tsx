"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, LogOut } from "lucide-react";

interface SignOutModalProps {
	isOpen: boolean;
	isLoggingOut: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

export function SignOutModal({ isOpen, isLoggingOut, onClose, onConfirm }: SignOutModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] bg-background border-purple-700/90">
				<DialogHeader>
					<DialogTitle className="text-foreground flex items-center gap-2">
						<LogOut className="h-5 w-5" />
						Log Out
					</DialogTitle>
					<DialogDescription className="text-foreground/80">
						Are you sure you want to Log out? You will be redirected to the login page.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-end gap-2">
					<Button
						variant="outline"
						onClick={onClose}
						className="cursor-pointer text-foreground border-foreground/20 hover:bg-purple-700/20"
					>
						Cancel
					</Button>
					<Button
						variant="default"
						onClick={onConfirm}
						className="cursor-pointer bg-indigo-200 text-black hover:bg-indigo-300 hover:text-black flex items-center gap-2"
					>
						{!isLoggingOut ? (
							<>
								<LogOut className="h-4 w-4" />
								Log Out
							</>
						) : (
							<>
								<Loader2 className="animate-spin" />
								Loging Out
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
