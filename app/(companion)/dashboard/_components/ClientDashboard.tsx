// app/dashboard/ClientDashboard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePluginGenerator, useGetPluginGenerators } from "@/providers/plugin_generator";
import { CreatePluginGeneratorRequest } from "@/types/plugins.types";
import Link from "next/link";
import { useState } from "react";

export default function ClientDashboard() {
	return (
		<>
			<main className="p-4 max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Your Plugin Generator Sessions</h2>
				<CreatePluginSession />
				<PluginSessions />
			</main>
		</>
	);
}

function CreatePluginSession() {
	const [pluginName, setPluginName] = useState("");
	const { mutate: createPlugin, isLoading } = useCreatePluginGenerator();

	const handleCreate = () => {
		if (!pluginName) return;
		const request: CreatePluginGeneratorRequest = { pluginName };
		createPlugin(request, {
			onSuccess: () => {
				setPluginName("");
			},
		});
	};

	return (
		<div className="mb-6">
			<h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-100">Create a New Plugin Session</h3>
			<div className="flex gap-2">
				<Input
					placeholder="Enter plugin session name (e.g., Add to Cart Button Color)"
					value={pluginName}
					onChange={(e) => setPluginName(e.target.value)}
					className="w-full max-w-md"
				/>
				<Button
					onClick={handleCreate}
					disabled={isLoading || !pluginName}
					className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
				>
					{isLoading ? "Creating..." : "Create Session"}
				</Button>
			</div>
		</div>
	);
}

function PluginSessions() {
	const { data: pluginSessions, isFetching } = useGetPluginGenerators();
	console.log(pluginSessions);

	if (isFetching) {
		return <p className="text-gray-600 dark:text-gray-100">Loading plugin sessions...</p>;
	}

	if (!pluginSessions || pluginSessions.length === 0) {
		return <p className="text-gray-600 dark:text-gray-100">No plugin sessions found. Create one to get started!</p>;
	}

	return (
		<div className="grid gap-4">
			{pluginSessions.map((session) => (
				<Link
					key={session.pluginId}
					href={`/chat?plugin_id=${session.pluginId}`}
					className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition"
				>
					<h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{session.pluginName}</h4>
					<p className="text-gray-600 dark:text-gray-100">{session.isFinal ? "Plugin Generated" : "In Progress"}</p>
				</Link>
			))}
		</div>
	);
}
