// src/components/AlertProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type AlertType = "info" | "success" | "warning" | "error";

interface Alert {
  id: number;
  type: AlertType;
  message: string;
  duration: number;
}

interface AlertContextType {
  alertInfo: (message: string, duration?: number) => void;
  alertSuccess: (message: string, duration?: number) => void;
  alertWarning: (message: string, duration?: number) => void;
  alertError: (message: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let nextId = 1;

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback(
    (type: AlertType, message: string, duration = 3000) => {
      const id = nextId++;
      setAlerts((prev) => [...prev, { id, type, message, duration }]);

      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, duration);
    },
    []
  );

  const contextValue: AlertContextType = {
    alertInfo: (msg, d) => showAlert("info", msg, d),
    alertSuccess: (msg, d) => showAlert("success", msg, d),
    alertWarning: (msg, d) => showAlert("warning", msg, d),
    alertError: (msg, d) => showAlert("error", msg, d),
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {/* Alert container */}
      <div className="fixed top-5 right-5 flex flex-col gap-3 z-50">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 
              ${alert.type === "info" ? "bg-blue-500" : ""}
              ${alert.type === "success" ? "bg-green-500" : ""}
              ${alert.type === "warning" ? "bg-yellow-500 text-black" : ""}
              ${alert.type === "error" ? "bg-red-500" : ""}
            `}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
};
