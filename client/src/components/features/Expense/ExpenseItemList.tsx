"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
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

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/form/SelectComponent";
import {
  ExpenseCategoryValues,
  ExpenseCategory,
  ExpenseItem,
  Expense,
} from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import { useState } from "react";
import { AlertDialogComponent } from "@/components/alert-dialog-component";

const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100),
  amount: z.number().min(0),
  description: z.string().optional(),
  qty: z.number().min(1),
  category: z.string(),
});

const ExpenseItemList = () => {
  const { expense, updateExpense, isSubmitting } = useExpenseStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenseItemId, setExpenseItemId] = useState<string | undefined>(
    undefined
  );

  const expenseItems = expense?.items || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: ExpenseCategoryValues[0],
      description: "",
      amount: 0,
      qty: 1,
    },
  });

  const setFormItem = (expenseItem: ExpenseItem) => {
    form.setValue("id", expenseItem.id);
    form.setValue("name", expenseItem.name);
    form.setValue("category", expenseItem.category);
    form.setValue("amount", expenseItem.amount);
    form.setValue("description", expenseItem.description);
    form.setValue("qty", expenseItem.qty);
  };

  const onSheetClose = () => {
    setIsSheetOpen(false);
    form.reset();
  };

  async function deleteExpenseItem(expenseItemId: string | undefined) {
    if (!expenseItemId) {
      console.error("Expense item ID is undefined");
      return;
    }

    const updatedItems = expenseItems.filter(
      (item) => item.id !== expenseItemId
    );
    const updatedExpense = {
      ...expense,
      items: updatedItems,
    };

    await updateExpense(updatedExpense as Expense, expense?.id || "");
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!expense) {
      console.error("No expense found to update");
      return;
    }

    let expenseItem = expenseItems.find((item) => item.id === data.id);

    if (expenseItem) {
      expenseItem = {
        ...expenseItem,
        ...data,
        category: data.category as ExpenseCategory,
      };
    } else {
      expenseItem = {
        ...data,
        category: data.category as ExpenseCategory,
      };
    }

    expense.items = [
      ...expenseItems.filter((item) => item.id !== data.id),
      expenseItem,
    ];

    await updateExpense(expense, expense?.id || "", onSheetClose);
  }

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Items</h1>
      </div>

      <AlertDialogComponent
        isOpen={isDialogOpen}
        onAction={async () => {
          console.log("Alert dialog action performed");
          await deleteExpenseItem(expenseItemId);
          setIsDialogOpen(false);
        }}
        isActionInProgress={isSubmitting}
        onCancel={() => setIsDialogOpen(false)}
        title="Are you absolutely sure?"
        description="This action will permanently delete the item."
        actionText="Continue"
        cancelText="Cancel"
      />

      <div className="flex flex-col gap-2 mt-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p>
              {expenseItems.length === 0
                ? "No item found for this expense."
                : "Add additional items to this expense."}
            </p>
            <Button className="mt-4" onClick={() => setIsSheetOpen(true)}>
              Add item
            </Button>
          </CardContent>
        </Card>

        {expenseItems.map((expenseItem) => (
          <Card key={expenseItem.id}>
            <CardHeader>
              <CardTitle>{expenseItem.name}</CardTitle>
              <CardDescription className="text-lg">
                {expenseItem.description || "No description provided"}
              </CardDescription>
              <CardAction>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => {
                      setFormItem(expenseItem);
                      setIsSheetOpen(true);
                    }}
                    className="flex-1"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsDialogOpen(true);
                      setExpenseItemId(expenseItem.id);
                    }}
                    className="flex-1"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground">Category: </span>
                <span className="font-semibold">{expenseItem.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground">Amount: </span>
                <span className="font-semibold">${expenseItem.amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground">Qty: </span>
                <span className="font-semibold">{expenseItem.qty}</span>
              </div>
              <p className="text-sm mt-2 text-gray-500">
                {/* Added on {expenseItem.date} */}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent onCloseAutoFocus={onSheetClose}>
          <SheetHeader>
            <SheetTitle>Edit Expense Item</SheetTitle>
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
                            options={ExpenseCategoryValues}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" variant={"default"}>
                    Submit
                  </Button>
                </form>
              </Form>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExpenseItemList;

ExpenseItemList.displayName = "ExpenseItemList";
