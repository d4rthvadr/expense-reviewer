"use server";

import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import z from "zod";

const testUser = {
  id: "1",
  email: "test@example.com",
  password: "password123",
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const getFormData = (data: FormData) => {
  return {
    email: data.get("email") || "",
    password: data.get("password") || "",
  };
};
export async function login(prevState: unknown, data: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(data.entries()));
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      formData: getFormData(data),
    };
  }

  const { email, password } = result.data;

  if (email !== testUser.email || password !== testUser.password) {
    return {
      formData: getFormData(data),
      errors: {
        email: "Invalid email or password",
        password: "Invalid email or password",
      },
    };
  }

  await createSession(testUser.id, testUser.email);

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
