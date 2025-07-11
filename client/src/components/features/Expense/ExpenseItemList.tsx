"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  Expense,
  ExpenseCategoryValues,
  ExpenseCategory,
  ExpenseItem,
} from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import { useRef } from "react";

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
  const expense = useExpenseStore((state) => state.expense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);

  const expenseItems = expense?.items || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
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
    // console.log("called onSheetClose");
    // if (sheetTriggerRef.current) {
    //   sheetTriggerRef.current.click();
    //   console.log("Sheet closed, resetting form");
    // }
    form.reset();
  };

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

      <div className="flex flex-col gap-2 mt-2">
        <Sheet>
          {expenseItems.length === 0 ? (
            <Card>
              <CardHeader>
                {/* <CardTitle>{expenseItem.name}</CardTitle> */}
                <CardDescription className="text-lg">
                  No item found for this expense.
                </CardDescription>
                <CardAction></CardAction>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          ) : null}
          {expenseItems.map((expenseItem) => (
            <Card key={expenseItem.id}>
              <CardHeader>
                <CardTitle>{expenseItem.name}</CardTitle>
                <CardDescription className="text-lg">
                  {expenseItem.description}
                </CardDescription>
                <CardAction>
                  <SheetTrigger asChild>
                    <Button
                      ref={sheetTriggerRef}
                      onClick={() => setFormItem(expenseItem)}
                      className="w-full"
                      variant="outline"
                    >
                      Edit Item
                    </Button>
                  </SheetTrigger>
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
                  Added on {expenseItem.date}
                </p>
              </CardContent>
            </Card>
          ))}

          {expense && (
            <SheetTrigger asChild>
              <Button>Add item</Button>
            </SheetTrigger>
          )}
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
                            <Input type="text" {...field} />
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
                              type="number"
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
                    <Button
                      type="submit"
                      className="w-full"
                      variant={"default"}
                    >
                      Submit
                    </Button>
                  </form>
                </Form>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ExpenseItemList;

ExpenseItemList.displayName = "ExpenseItemList";
