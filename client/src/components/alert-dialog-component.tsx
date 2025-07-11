import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertDialogProps {
  isOpen: boolean;
  isActionInProgress?: boolean;
  title: string;
  description: string;
  actionText?: string;
  cancelText?: string;
  // Callbacks for handling actions
  onCancel: () => void;
  onAction: () => void;
}

export const AlertDialogComponent = ({
  isOpen,
  onAction,
  onCancel,
  title,
  isActionInProgress = false,
  description,
  actionText = "Continue",
  cancelText = "Cancel",
}: AlertDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onCancel?.()}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isActionInProgress}
            onClick={() => onAction?.()}
          >
            {isActionInProgress ? "Processing..." : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AlertDialogComponent.displayName = "AlertDialog";
