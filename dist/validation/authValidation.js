import { z } from "zod";
export const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2).max(15),
    password: z.string().
        min(8, "Password must be at least 8 characters")
        .max(100, "Password must be no more than 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().
        min(8, "Password must be at least 8 characters")
        .max(100, "Password must be no more than 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});
export const forgetPasswordSchema = z.object({
    email: z.string({ message: "Email is required." }).email(),
});
export const resetPasswordSchema = z
    .object({
    email: z
        .string({ message: "Email is required." })
        .email({ message: "Please enter correct email" }),
    token: z.string({ message: "Please make sure you are using correct url." }),
    password: z
        .string({ message: "Password is required" })
        .min(6, { message: "Password must be 3 characters long" }),
    confirm_password: z.string({ message: "Confirm Password is required" }),
})
    .refine((data) => data.password === data.confirm_password, {
    message: "Confirm password not matched",
    path: ["confirm_password"],
});
