import * as yup from "yup";

export const SignUpValidationSchema = yup.object({
	firstName: yup.string().min(2, "Too Short!").max(50, "Too Long!").required("First Name is required"),
	lastName: yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Last Name is required"),
	email: yup.string().email("Enter a valid email").required("Email is required"),
	password: yup
		.string()
		.min(8, "password must be at least 8 characters")
		.matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, "password must contain at least one letter and one number")
		.required("enter password"),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref("password"), ""], "passwords do not match")
		.required("confirm password is required"),
});

export type SignupWithPasswordRequest = yup.InferType<typeof SignUpValidationSchema>;

export type SignUpWithPasswordResponse = {
    user_pid: string;
    email: string;
    first_name: string;
    last_name: string;
    token: string;
};

export const LoginValidationSchema = yup.object({
	email: yup.string().email("Enter a valid email").required("Email is required"),
	password: yup.string().min(6).required("Enter password"),
});

export type LoginUserWithPasswordRequest = yup.InferType<typeof LoginValidationSchema>;

export type UserInfoResponse = {
    user_id: string;
    first_name: string;
	last_name: string;
	email: string;
};

export type LoginUserResponse = {
	token: string;
	email: string;
	user_id: string;
	user: UserInfoResponse;
};


