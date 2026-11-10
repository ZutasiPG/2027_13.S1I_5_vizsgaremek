import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Role } from "./data";

type AppState = {
  role: Role;
  setRole: (role: Role) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  toast: string;
  notify: (message: string) => void;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("utas");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const setRole = (next: Role) => {
    setRoleState(next);
    navigate(next === "utas" ? "/jegyeim" : next === "járművezető" ? "/driver" : "/admin");
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  return (
    <Context.Provider value={{ role, setRole, dark, setDark, toast, notify }}>
      {children}
    </Context.Provider>
  );
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("Hiányzó alkalmazás-kontextus");
  return value;
}
