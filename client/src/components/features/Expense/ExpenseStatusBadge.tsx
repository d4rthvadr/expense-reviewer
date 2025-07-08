const ExpenseStatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
        ${status === "APPROVED" ? "bg-green-100 text-green-800" : ""}
        ${status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
        ${status === "REJECTED" ? "bg-red-100 text-red-800" : ""}
        ${
          !["APPROVED", "PENDING", "REJECTED"].includes(status)
            ? "bg-gray-100 text-gray-800"
            : ""
        }
      `}
    >
      {status}
    </span>
  );
};

export default ExpenseStatusBadge;

ExpenseStatusBadge.displayName = "ExpenseStatusBadge";
