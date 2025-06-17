// stores/useChatStore.ts
import { create } from "zustand";

interface State {
	input: string;
	isGenerating: boolean; // Track if plugin generation is in progress
}

interface Actions {
	setInput: (input: string) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
	setIsGenerating: (isGenerating: boolean) => void;
}

const useChatStore = create<State & Actions>()((set) => ({
	input: "",
	isGenerating: false,
	setInput: (input) => set({ input }),
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) =>
		set({ input: e.target.value }),
	setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

export default useChatStore;
