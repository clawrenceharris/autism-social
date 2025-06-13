import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.scss";
import App from "./App.tsx";
import { ModalProvider, AuthProvider, ToastProvider } from "./context";
import { ToastContainer } from "./components/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <App />
          <ToastContainer />
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
