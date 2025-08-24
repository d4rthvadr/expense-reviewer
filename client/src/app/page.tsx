import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Welcome to Expense Reviewer
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Track your expenses efficiently
            </p>
          </div>

          <SignedOut>
            <div className="space-y-4 sm:space-y-6">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="group relative w-full flex justify-center py-3 sm:py-4 px-6 sm:px-8 border border-transparent text-sm sm:text-base lg:text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-h-[48px] sm:min-h-[52px]">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="group relative w-full flex justify-center py-3 sm:py-4 px-6 sm:px-8 border border-gray-300 text-sm sm:text-base lg:text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[48px] sm:min-h-[52px]">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
