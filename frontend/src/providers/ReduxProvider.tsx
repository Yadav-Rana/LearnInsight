"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect, useRef } from "react";
import { checkAuth } from "@/store/slices/authSlice";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    // Check for existing auth session on mount
    if (!initialized.current) {
      initialized.current = true;
      store.dispatch(checkAuth());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
