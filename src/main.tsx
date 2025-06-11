import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/global.scss";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import {
  ModalProvider,
  UserProvider,
  AuthProvider,
  ToastProvider,
} from "./context";
import { ToastContainer } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <ToastProvider>
            <ModalProvider>
              <App />
              <ToastContainer />
            </ModalProvider>
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
