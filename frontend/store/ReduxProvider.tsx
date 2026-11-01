"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import AuthBootstrap from "./AuthBootstrap";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider><AuthBootstrap>{children}</AuthBootstrap></ToastProvider>
    </Provider>
  );
}
