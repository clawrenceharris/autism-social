import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout, ScenarioLayout } from "./components";
import { HomePage, ScenarioPage, ScenariosPage } from "./pages";
import { ModalProvider, ToastProvider } from "./context";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage/LoginPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<RootLayout />}>
                <Route path="/" element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                } />
                <Route path="/scenarios" element={
                  <PrivateRoute>
                    <ScenariosPage />
                  </PrivateRoute>
                } />
              </Route>

              <Route element={<ScenarioLayout />}>
                <Route path="/scenario/:scenarioId" element={
                  <PrivateRoute>
                    <ScenarioPage />
                  </PrivateRoute>
                } />
                <Route
                  path="/scenario/:scenarioId/dialogue/:dialogueId"
                  element={
                    <PrivateRoute>
                      <ScenarioPage />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;