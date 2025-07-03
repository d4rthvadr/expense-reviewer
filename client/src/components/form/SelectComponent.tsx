import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "./types";

const SelectComponent = ({
  placeholder = "Select an option",
  options,
  field,
}: {
  placeholder?: string;
  field: Field;
  options: string[];
}) => {
  return (
    <Select {...field}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;

SelectComponent.displayName = "SelectComponent";
