import { Progress } from "@/components/ui/progress";

const ExpenseDetails = () => {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col gap-2 mb-8">
        <p className="text-sm text-muted-foreground">Expense Progress</p>
        <Progress value={33} />
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Id:</span>
        <span>Some-id</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Name:</span>
        <span>Some Expense</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Type:</span>
        <span>Expense</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Status:</span>
        <span>Pending</span>
      </div>
      <div className="flex item-center gap-2">
        <span className="font-bold">Created On:</span>
        <span>Some Date</span>
      </div>
    </div>
  );
};

export default ExpenseDetails;

ExpenseDetails.displayName = "ExpenseDetails";
