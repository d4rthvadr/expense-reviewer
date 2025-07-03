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
import { ExpenseCategoryValues, ExpenseCategory } from "@/constants/expense";

type expenseItemItem = {
  id: number;
  image: string;
  name: string;
  description?: string;
  qty?: number;
  category?: ExpenseCategory;
  currency?: string;
  amount: string;
  date: string;
};

const ExpenseCategories = ExpenseCategoryValues as [string, ...string[]];

const expenseItems: expenseItemItem[] = [
  {
    id: 1,
    name: "Groceries",
    description: "Monthly grocery shopping",
    qty: 1,
    category: ExpenseCategory.FOOD,
    currency: "USD",
    amount: "50",
    date: "2023-10-01",
    image: "https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg",
  },
  {
    id: 2,
    name: "Utilities",
    description: "Monthly utility bills",
    qty: 1,
    category: ExpenseCategory.UTILITIES,
    currency: "USD",
    amount: "100",
    date: "2023-10-02",
    image: "https://images.pexels.com/photos/1234568/pexels-photo-1234568.jpeg",
  },
  {
    id: 3,
    name: "Rent",
    amount: "1200",
    date: "2023-10-03",
    description: "Monthly rent payment",
    qty: 1,
    category: ExpenseCategory.HOUSING,
    currency: "USD",
    image: "https://images.pexels.com/photos/1234569/pexels-photo-1234569.jpeg",
  },
  {
    id: 4,
    name: "Internet",
    amount: "60",
    date: "2023-10-04",
    description: "Monthly internet bill",
    qty: 1,
    category: ExpenseCategory.MISCELLANEOUS,
    currency: "USD",
    image: "https://images.pexels.com/photos/1234570/pexels-photo-1234570.jpeg",
  },
  {
    id: 5,
    name: "Dining Out",
    amount: "30",
    date: "2023-10-05",
    description: "Dinner at a restaurant",
    qty: 1,
    category: ExpenseCategory.FOOD,
    currency: "USD",
    image: "https://images.pexels.com/photos/1234571/pexels-photo-1234571.jpeg",
  },
];

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100),
  type: z.string(),
  amount: z.number().min(0),
  qty: z.number().min(1),
  category: z.enum(ExpenseCategories),
});

const ExpenseItemList = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: ExpenseCategories[0],
      amount: 0,
      qty: 1,
      type: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Handle form submission logic here
    console.log("Form submitted:", data);
  }

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Items</h1>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <Sheet>
          {expenseItems.map((expenseItem) => (
            <Card key={expenseItem.id}>
              <CardHeader>
                <CardTitle>{expenseItem.name}</CardTitle>
                <CardDescription className="text-lg">
                  {expenseItem.description}
                </CardDescription>
                <CardAction>
                  <SheetTrigger asChild>
                    <Button>Edit </Button>
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
          <SheetContent>
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
                            <Input type="text" {...field} />
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
                              options={ExpenseCategories}
                            />
                          </FormControl>
                          <FormDescription>
                            The status of expense. e.g., "Pending", "Approved",
                            "Rejected"
                          </FormDescription>
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
