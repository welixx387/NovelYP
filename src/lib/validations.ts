import { z } from "zod";
import { SUBSCRIPTION_PLANS } from "@/types";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Имя должно быть не короче 2 символов")
      .max(50, "Имя слишком длинное"),
    email: z.string().email("Введите корректный email"),
    password: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов")
      .max(72, "Пароль слишком длинный")
      .regex(/[a-zA-Zа-яА-Я]/, "Пароль должен содержать хотя бы одну букву")
      .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Введите корректный email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Отзыв должен быть не короче 10 символов").max(2000),
});

export const commentSchema = z.object({
  text: z.string().min(1, "Комментарий не может быть пустым").max(1000),
});

export const checkoutSchema = z.object({
  plan: z.enum(SUBSCRIPTION_PLANS),
  asset: z.enum(["USDT", "TON"]),
});
