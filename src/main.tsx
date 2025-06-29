import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.scss";
import App from "./App.tsx";
import { ModalProvider, AuthProvider, ToastProvider } from "./context";
import { ToastContainer } from "./components/index.ts";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ModalProvider>
            <App />
            <ToastContainer />
          </ModalProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
