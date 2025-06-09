import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import "./styles/global.scss";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import { store } from "./store";
import {
  ToastProvider,
  ModalProvider,
  UserProvider,
  AuthProvider,
} from "./context";
import { ToastContainer } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
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
    </Provider>
  </StrictMode>
);