import { ExpenseStatus } from "@/constants/expense";
import ExpenseStatusBadge from "./ExpenseStatusBadge";
import { formatCurrency } from "@/lib/money.util";
import { useGetExpense } from "@/hooks";
import { Button } from "@/components/ui/button";

const ExpenseDetails = ({ onEditExpense }: { onEditExpense: () => void }) => {
  const { expense } = useGetExpense();

  if (!expense) {
    return (
      <>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={onEditExpense}
        >
          Create Expense
        </Button>
      </>
    );
  }

  const {
    id: expenseId,
    currency,
    createdAt,
    name,
    totalAmount = 0,
    type = "General",
    status = ExpenseStatus.PENDING,
  } = expense;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex item-center gap-2">
        <span className="font-bold">Id:</span>
        <span>{expenseId}</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Name:</span>
        <span>{name}</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Total amount:</span>
        <span>{formatCurrency(totalAmount, currency!)}</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Type:</span>
        <span>{type}</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Status:</span>
        <span>{<ExpenseStatusBadge status={status} />}</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Created On:</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
};

export default ExpenseDetails;

ExpenseDetails.displayName = "ExpenseDetails";
