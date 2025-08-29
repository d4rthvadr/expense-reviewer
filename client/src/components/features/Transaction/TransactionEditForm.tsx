"use client";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/form/SelectComponent";
import { useTransactionStore } from "@/stores/transactionStore";
import { Currency } from "@/constants/currency.enum";
import { Category } from "@/constants/category.enum";
import {
  CategoryValues,
  Transaction,
  TransactionType,
} from "@/constants/transaction";
import TransactionTypeTabs from "./TransactionTypeTabs";

const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100),
  amount: z.number().min(0),
  currency: z.string().optional(),
  description: z.string().optional(),
  qty: z.number().min(1),
  category: z.enum(CategoryValues as [string, ...string[]]),
  type: z.enum(["EXPENSE", "INCOME"] as const),
});

const TransactionEditForm = ({
  expense,
  onClose,
}: {
  expense?: Transaction;
  onClose: () => void;
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(
    expense?.type || "EXPENSE"
  );

  const { updateTransaction, createTransaction, isLoading } =
    useTransactionStore();

  const isEditing = !!expense?.id;

  const getTitle = () => {
    if (isEditing) {
      return `Edit ${selectedType === "EXPENSE" ? "Expense" : "Income"}`;
    }
    return "Add Transaction";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: expense?.name || "",
      category: expense?.category || Category.OTHER,
      description: expense?.description || "",
      currency: expense?.currency ?? Currency.USD,
      amount: expense?.amount ?? 0,
      qty: expense?.qty ?? 1,
      type: selectedType,
    },
  });

  // Update form when transaction type changes
  useEffect(() => {
    form.setValue("type", selectedType);
  }, [selectedType, form]);

  // Update selected type when editing different transaction
  useEffect(() => {
    if (expense?.type) {
      setSelectedType(expense.type);
    }
  }, [expense?.type]);

  const onSheetClose = () => {
    form.reset();
    onClose();
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const transactionData = {
      id: expense?.id,
      name: data.name,
      amount: data.amount,
      category: data.category as unknown as Category,
      currency: data.currency || Currency.USD,
      description: data.description || "",
      qty: data.qty,
      type: selectedType,
      createdAt: expense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing && expense?.id) {
      // Update existing transaction
      await updateTransaction(transactionData, expense.id, onSheetClose);
      console.log("Transaction updated successfully");
      return;
    }

    await createTransaction(transactionData, onSheetClose);
    console.log("Transaction created successfully");
  }

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Items</h1>
        </div>

        <SheetContent onCloseAutoFocus={onSheetClose}>
          <SheetHeader>
            <SheetTitle>{getTitle()}</SheetTitle>
            <SheetDescription className="mt-3">
              {/* Transaction Type Tabs */}
              <TransactionTypeTabs
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                disabled={false}
              />

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
                          <Input
                            placeholder={`Enter ${
                              selectedType === "EXPENSE" ? "expense" : "income"
                            } name`}
                            {...field}
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
                            placeholder={`Add ${
                              selectedType === "EXPENSE" ? "expense" : "income"
                            } details...`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className={
                              selectedType === "EXPENSE"
                                ? "border-red-200 focus:border-red-300"
                                : "border-green-200 focus:border-green-300"
                            }
                          />
                        </FormControl>
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
                            options={CategoryValues}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className={`w-full ${
                      selectedType === "EXPENSE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    variant={"default"}
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </Form>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </div>
    </>
  );
};

export default TransactionEditForm;

TransactionEditForm.displayName = "TransactionEditForm";
