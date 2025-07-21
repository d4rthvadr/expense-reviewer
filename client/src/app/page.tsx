import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <header className="bg-blue-500 text-white p-6">
          <h1 className="text-4xl font-bold">Expense Reviewer</h1>
          <p className="mt-2 text-lg">
            Track, review, and manage your expenses effortlessly.
          </p>
        </header>

        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start p-6">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Why Choose Expense Reviewer?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-500 font-bold">✔</span>
                <p className="ml-2">
                  Organize expenses by categories and tags.
                </p>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 font-bold">✔</span>
                <p className="ml-2">Quickly search and filter expenses.</p>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 font-bold">✔</span>
                <p className="ml-2">Set reminders for recurring expenses.</p>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-xl font-bold">Custom Expense Groups</h3>
                <p className="mt-2">
                  Organize expenses in ways tailored to your workflow.
                </p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-xl font-bold">Instant Search</h3>
                <p className="mt-2">
                  Find expenses quickly with a fast and beautiful interface.
                </p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-xl font-bold">Detailed Profiles</h3>
                <p className="mt-2">
                  View all details and interactions for each expense.
                </p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-xl font-bold">End-to-End Encryption</h3>
                <p className="mt-2">Your data is secure and private.</p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to take control of your expenses?
            </h2>
            <Button className="bg-blue-500 text-white px-6 py-3 rounded">
              Get Started - No Credit Card Required
            </Button>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
