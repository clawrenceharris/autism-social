import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.scss";
import App from "./App.tsx";
import {
  ModalProvider,
  UserProvider,
  AuthProvider,
  ToastProvider,
} from "./context";
import { ToastContainer } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <UserProvider>
          <ModalProvider>
            <App />
            <ToastContainer />
          </ModalProvider>
        </UserProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
