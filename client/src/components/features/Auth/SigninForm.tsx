"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { login } from "@/actions/auth";
import { useFormStatus } from "react-dom";

const SignInForm = () => {
  const [state, signInAction] = useActionState(login, undefined);
  const { pending } = useFormStatus();

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form action={signInAction}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                defaultValue={(state?.formData?.email || "")?.toString()}
                required
              />
              {state?.errors?.email && (
                <p className="text-red-500">{state.errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && (
                <p className="text-red-500">{state?.errors?.password}</p>
              )}
            </div>
          </div>
          <div className="mt-2">
            <SubmitButton isPending={pending} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

function SubmitButton({ isPending }: { isPending?: boolean }) {
  // const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      {isPending ? "Logging in..." : "Login"}
    </Button>
  );
}

export default SignInForm;

SignInForm.displayName = "SignInForm";
