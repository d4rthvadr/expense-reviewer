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
import { Budget, CategoryValues } from "@/constants/budget";
import SelectComponent from "@/components/form/SelectComponent";
import { Currency } from "@/constants/currency.enum";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createBudget, updateBudget } from "@/actions/budget";
import { Category } from "@/constants/category.enum";

// Schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100)
    .optional(),
  amount: z.number().min(0, { message: "Amount must be positive" }),
  category: z.enum(CategoryValues as [string, ...string[]]),
  currency: z.string().optional(),
  description: z.string().optional(),
});

// Component
const BudgetEditForm = ({
  onClose,
  budget,
}: {
  onClose: () => void;
  budget?: Budget | null;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreateMode = !budget || Object.keys(budget).length === 0;

  const {
    id: budgetId,
    name = "",
    amount = 0,
    category = Category.OTHER,
    currency = Currency.USD,
    description = "",
  } = budget || {};

  const title = budgetId ? `Edit Budget ${budgetId}` : "Create Budget";

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: budgetId,
      name: name,
      amount: amount,
      category: category,
      currency: currency,
      description: description,
    },
  });

  // Update form values when budget prop changes
  useEffect(() => {
    if (budget) {
      form.reset({
        id: budget.id,
        name: budget.name || "",
        amount: budget.amount || 0,
        category: budget.category || Category.OTHER,
        currency: budget.currency || Currency.USD,
        description: budget.description || "",
      });
    } else {
      // Reset for create mode
      form.reset({
        id: "",
        name: "",
        amount: 0,
        category: Category.OTHER,
        currency: Currency.USD,
        description: "",
      });
    }
  }, [budget, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const budgetData: Budget = {
        id: data.id || "",
        name: data.name,
        amount: data.amount,
        category: data.category as Category,
        currency: data.currency || Currency.USD,
        description: data.description,
        createdAt: budget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isCreateMode) {
        const result = await createBudget(budgetData);
        if (result.success) {
          toast.success("Budget created successfully");
          onClose();
        } else {
          toast.error(result.error || "Failed to create budget");
        }
        return;
      }

      // Update existing budget
      const result = await updateBudget(budgetData, budget!.id);
      if (result.success) {
        toast.success("Budget updated successfully");
        onClose();
      } else {
        toast.error(result.error || "Failed to update budget");
      }
    } catch (error) {
      toast.error(
        isCreateMode ? "Failed to create budget" : "Failed to update budget"
      );
      console.error("Error submitting budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = CategoryValues;

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Monthly Groceries" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your budget a descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Set your budget limit amount.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectComponent
                        field={field}
                        placeholder="Select category"
                        options={categoryOptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional description for this budget..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any additional notes about this budget.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant={"default"} disabled={isSubmitting}>
                {isSubmitting
                  ? isCreateMode
                    ? "Creating..."
                    : "Updating..."
                  : isCreateMode
                  ? "Create Budget"
                  : "Update Budget"}
              </Button>
            </form>
          </Form>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default BudgetEditForm;

BudgetEditForm.displayName = "BudgetEditForm";
