"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { frontendAxios } from "@/config/axios";
import { RETURN_TO_URL_PARAM_NAME } from "@/config/constants";
import { T_SEResponse } from "@/types/request_response.types";
import { SignUpValidationSchema, SignupWithPasswordRequest } from "@/types/user.types";
import { AxiosResponse } from "axios";
import { useFormik } from "formik";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function SignupForm() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const formik = useFormik({
		initialValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationSchema: SignUpValidationSchema,
		validateOnChange: false,
		validateOnBlur: true,
		onSubmit: async (values) => {
			setLoading(true);

			const payload = {
				first_name: values.firstName,
				last_name: values.lastName,
				email: values.email,
				password: values.password,
			};

			const signupPromise = frontendAxios.post("/auth/signup", payload);

			toast.promise(signupPromise, {
				loading: "Signing up...",
				success: (response: AxiosResponse<T_SEResponse<SignupWithPasswordRequest>>) => {
					const data = response.data;
					if (data.success) {
						const returnTo = searchParams.get(RETURN_TO_URL_PARAM_NAME) || "/dashboard";
						router.push(decodeURIComponent(returnTo));
						router.refresh();
						return "Signup successful!";
					} else {
						setLoading(false);
						const errorMessage =
							Array.isArray(data.errors) && data.errors.length > 0
								? data.errors[0]
								: "Failed to sign up, please try again with different credentials";
						throw new Error(errorMessage);
					}
				},
				error: (error: Error) => {
					setLoading(false);
					return error.message || "An error occurred during signup. Please try again.";
				},
			});
		},
	});

	const handleFieldChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			formik.handleChange(e);
		},
		[formik]
	);

	return (
		<form onSubmit={formik.handleSubmit} className="space-y-5">
			<div className="flex gap-5">
				<div className="space-y-1">
					<Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
						First Name
					</Label>
					<Input
						id="firstName"
						type="text"
						placeholder="Enter your first name"
						disabled={loading}
						className="h-12 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
						value={formik.values.firstName}
						onChange={handleFieldChange}
						onBlur={formik.handleBlur}
					/>
					{formik.touched.firstName && formik.errors.firstName ? (
						<p className="text-red-500 dark:text-red-400 text-sm">{formik.errors.firstName}</p>
					) : null}
				</div>
				<div className="space-y-1">
					<Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Last Name
					</Label>
					<Input
						id="lastName"
						type="text"
						placeholder="Enter your last name"
						disabled={loading}
						className="h-12 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
						value={formik.values.lastName}
						onChange={handleFieldChange}
						onBlur={formik.handleBlur}
					/>
					{formik.touched.lastName && formik.errors.lastName ? (
						<p className="text-red-500 dark:text-red-400 text-sm">{formik.errors.lastName}</p>
					) : null}
				</div>
			</div>
			<div className="space-y-1">
				<Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
					Email
				</Label>
				<Input
					id="email"
					type="email"
					placeholder="Enter your email"
					disabled={loading}
					className="h-12 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
					value={formik.values.email}
					onChange={handleFieldChange}
					onBlur={formik.handleBlur}
				/>
				{formik.touched.email && formik.errors.email ? (
					<p className="text-red-500 dark:text-red-400 text-sm">{formik.errors.email}</p>
				) : null}
			</div>
			<div className="space-y-1">
				<Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
					Password
				</Label>
				<Input
					id="password"
					type="password"
					placeholder="Enter your password"
					disabled={loading}
					className="h-12 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
					value={formik.values.password}
					onChange={handleFieldChange}
					onBlur={formik.handleBlur}
				/>
				{formik.touched.password && formik.errors.password ? (
					<p className="text-red-500 dark:text-red-400 text-sm">{formik.errors.password}</p>
				) : null}
			</div>
			<div className="space-y-1">
				<Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
					Confirm Password
				</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="Confirm your password"
					disabled={loading}
					className="h-12 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
					value={formik.values.confirmPassword}
					onChange={handleFieldChange}
					onBlur={formik.handleBlur}
				/>
				{formik.touched.confirmPassword && formik.errors.confirmPassword ? (
					<p className="text-red-500 dark:text-red-400 text-sm">{formik.errors.confirmPassword}</p>
				) : null}
			</div>
			<Button
				type="submit"
				disabled={loading || formik.isSubmitting}
				className="w-full cursor-pointer h-12 flex items-center gap-2 mt-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
			>
				{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
				{loading ? "Processing..." : "Sign Up"}
			</Button>
		</form>
	);
}
