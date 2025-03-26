import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, X } from "lucide-react";

type ToastProps = {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/40";
      case "error":
        return "bg-red-500/20 border-red-500/40";
      case "info":
        return "bg-blue-500/20 border-blue-500/40";
      default:
        return "bg-gray-500/20 border-gray-500/40";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div
        className={`p-4 rounded-lg border ${getBackgroundColor()} text-white shadow-lg flex items-center`}
      >
        <div className="mr-3">{getIcon()}</div>
        <div className="flex-1">{message}</div>
        <button
          onClick={onClose}
          className="ml-4 text-white/70 hover:text-white focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
