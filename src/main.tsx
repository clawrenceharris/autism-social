import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.scss";
import App from "./App.tsx";
import {} from "./context/AuthContext.tsx";
import {} from "./context/UserContext.tsx";
import {
  ToastProvider,
  ModalProvider,
  UserProvider,
  AuthProvider,
} from "./context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <ToastProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </ToastProvider>
      </UserProvider>
    </AuthProvider>
  </StrictMode>
);
