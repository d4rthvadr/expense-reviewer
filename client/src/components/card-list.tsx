import React from "react";
import Image from "next/image";
type TransactionItem = {
  id: number;
  image: string;
  name: string;
  amount: string;
  date: string;
};

const latestTransactions: TransactionItem[] = [
  {
    id: 1,
    name: "Groceries",
    amount: "$50",
    date: "2023-10-01",
    image: "https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg",
  },
  {
    id: 2,
    name: "Utilities",
    amount: "$100",
    date: "2023-10-02",
    image: "https://images.pexels.com/photos/1234568/pexels-photo-1234568.jpeg",
  },
  {
    id: 3,
    name: "Rent",
    amount: "$1200",
    date: "2023-10-03",
    image: "https://images.pexels.com/photos/1234569/pexels-photo-1234569.jpeg",
  },
  {
    id: 4,
    name: "Internet",
    amount: "$60",
    date: "2023-10-04",
    image: "https://images.pexels.com/photos/1234570/pexels-photo-1234570.jpeg",
  },
  {
    id: 5,
    name: "Dining Out",
    amount: "$30",
    date: "2023-10-05",
    image: "https://images.pexels.com/photos/1234571/pexels-photo-1234571.jpeg",
  },
];

const CardList = ({ title }: { title: string }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium">{title}</h1>
      <div className="flex flex-col gap-2">
        {latestTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border-b"
          >
            <div className="flex items-center">
              <Image
                src={transaction.image}
                alt={transaction.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-lg font-medium">{transaction.name}</h2>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
            <span className="text-lg font-semibold">{transaction.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

CardList.displayName = "CardList";
export default CardList;
