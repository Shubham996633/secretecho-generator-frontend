export interface Companion {
	id: string;
	companion_code: string;
	name: string;
	description: string;
	avatarUrl: string;
}

export const companions: Companion[] = [
	{
		id: "1",
		companion_code: "buddy",
		name: "EchoBuddy",
		description: "EchoBuddy is your warm, empathetic friend. Chat about your day or share what's on your mind!",
		avatarUrl: "/chat.jpg",
	},
	{
		id: "2",
		companion_code: "chef",
		name: "Chef EchoBite",
		description:
			"Chef EchoBite crafts delicious recipes for you. Discover cooking tips tailored to your taste with EchoChef!",
		avatarUrl: "/cheif.jpg",
	},
	{
		id: "3",
		companion_code: "doctor",
		name: "Dr. EchoCare",
		description: "Dr. EchoCare offers compassionate health guidance. Share your concerns for personalized advice!",
		avatarUrl: "/doctor.jpg",
	},
	{
		id: "4",
		companion_code: "fit",
		name: "EchoFit",
		description: "EchoFit energizes your fitness journey. Get custom workouts and nutrition tips to reach your goals!",
		avatarUrl: "/gym.jpg",
	},
	{
		id: "5",
		companion_code: "mind",
		name: "EchoMind",
		description:
			"EchoMind is your patient study mentor. Boost your learning with tailored academic support and excel in studies!",
		avatarUrl: "/study.jpg",
	},
];
