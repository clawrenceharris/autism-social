import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout, ScenarioLayout, UserLayout } from "./components";
import {
  HomePage,
  ScenarioPage,
  ScenariosPage,
  LoginPage,
  DashboardPage,
  YourScenariosPage,
  ProgressPage,
  CustomizationPage,
  ExplorePage,
  SignUpPage,
} from "./pages";
import { ModalProvider, ToastProvider } from "./context";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Admin Routes */}
              <Route element={<RootLayout />}>
                <Route path="/" element={
                  <AdminRoute>
                    <HomePage />
                  </AdminRoute>
                } />
                <Route path="/scenarios" element={
                  <AdminRoute>
                    <ScenariosPage />
                  </AdminRoute>
                } />
              </Route>

              <Route element={<ScenarioLayout />}>
                <Route path="/scenario/:scenarioId" element={
                  <AdminRoute>
                    <ScenarioPage />
                  </AdminRoute>
                } />
                <Route
                  path="/scenario/:scenarioId/dialogue/:dialogueId"
                  element={
                    <AdminRoute>
                      <ScenarioPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* User Routes */}
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={
                  <UserRoute>
                    <DashboardPage />
                  </UserRoute>
                } />
                <Route path="/your-scenarios" element={
                  <UserRoute>
                    <YourScenariosPage />
                  </UserRoute>
                } />
                <Route path="/progress" element={
                  <UserRoute>
                    <ProgressPage />
                  </UserRoute>
                } />
                <Route path="/customization" element={
                  <UserRoute>
                    <CustomizationPage />
                  </UserRoute>
                } />
                <Route path="/explore" element={
                  <UserRoute>
                    <ExplorePage />
                  </UserRoute>
                } />
              </Route>
            </Routes>
          </Router>
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;