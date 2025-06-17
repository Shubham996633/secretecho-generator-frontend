export type T_SEResponse<T> = {
	success: boolean;
	data?: T;
	errors: string[];
};
