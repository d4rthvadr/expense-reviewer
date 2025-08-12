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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/form/SelectComponent";
import { CategoryValues, ExpenseItem } from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import { Currency } from "@/constants/currency.enum";
import { Category } from "@/constants/category.enum";

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
});

const ExpenseItemEditForm = ({
  expense,
  onClose,
}: {
  expense: ExpenseItem;
  onClose: () => void;
}) => {
  const { updateExpense, createExpense, isSubmitting } = useExpenseStore();

  const sheetTitle = expense.id ? "Edit Expense Item" : "Add Expense Item";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: expense.name,
      category: expense.category,
      description: expense.description,
      currency: expense.currency ?? Currency.USD,
      amount: expense.amount ?? 0,
      qty: expense.qty ?? 1,
    },
  });

  const onSheetClose = () => {
    form.reset();
    onClose();
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!expense) {
      console.error("No expense found to update");
      return;
    }

    if (expense.id) {
      // Update existing expense
      await updateExpense(
        {
          ...expense, // Spread existing expense data
          ...data,
          category: data.category as unknown as Category,
        },
        expense.id,
        onSheetClose
      );
      console.log("Expense updated successfully");
      return;
    }

    await createExpense(
      {
        ...expense, // Spread existing expense data
        ...data,
        category: data.category as unknown as Category,
      },
      onSheetClose
    );

    console.log("Expense created successfully");
  }

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Items</h1>
        </div>

        <SheetContent onCloseAutoFocus={onSheetClose}>
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription className="mt-3">
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
                          <Input placeholder="eg: milk" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name of the expense item.
                        </FormDescription>
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
                          <Input placeholder="eg: milk" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the description of the expense item.
                        </FormDescription>
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
                        <FormDescription>
                          The quantity of the expense item.
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          The amount of the expense item.
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
                            options={CategoryValues}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
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
      </div>
    </>
  );
};

export default ExpenseItemEditForm;

ExpenseItemEditForm.displayName = "ExpenseItemEditForm";
