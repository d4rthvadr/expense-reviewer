"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Expense,
  ExpenseStatus,
  ExpenseStatusValues,
} from "@/constants/expense";
import SelectComponent from "@/components/form/SelectComponent";
import { Currency } from "@/constants/currency.enum";
import React from "react";
import { useCreateExpense, useGetExpense } from "@/app/hooks";
import { useUpdateExpense } from "@/app/hooks/useUpdateExpense";

// Schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100),
  type: z.string(),
  // currency: z.string(),
  status: z.string(),
});

// Component
const ExpenseEditForm = ({ onClose }: { onClose: () => void }) => {
  const { expense } = useGetExpense();

  const isCreateMode = expense === null || Object.keys(expense).length === 0;

  const { isSubmitting: isCreating, createExpense } = useCreateExpense();

  const { isSubmitting: isUpdating, updateExpense } = useUpdateExpense();

  const isSubmitting = isCreating || isUpdating;

  const {
    id: expenseId,
    name,
    type,
    status,
    currency,
    items = [],
  } = expense || {};

  const title = expenseId ? `Edit ${expenseId}` : "Create Expense";

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: expenseId,
      name: name,
      status: status,
      type: type,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const expenseData: Expense = {
      id: data.id!, // Use undefined if id is null
      currency: currency as Currency,
      name: data.name,
      type: data.type,
      totalAmount: 0, // Assuming totalAmount is not part of the form
      items,
      createdAt: new Date(),
      status: data.status as ExpenseStatus,
    };

    console.log("isCreateMode:", { isCreateMode, expense });

    if (isCreateMode) {
      await createExpense(expenseData, onClose);
      return;
    }
    await updateExpense(expenseData, expenseId!, onClose);
  }
  return (
    <>
      {/* <Toaster /> */}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <SelectComponent
                          field={field}
                          placeholder="Select status"
                          options={ExpenseStatusValues}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant={"default"}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </>
  );
};

export default ExpenseEditForm;

ExpenseEditForm.displayName = "ExpenseEditForm";
