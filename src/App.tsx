import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AdminRoute,
  AdminLayout,
  ScenarioLayout,
  UserLayout,
  UserRoute,
} from "./components";
import {
  HomePage,
  EditScenarioPage,
  ManageScenariosPage,
  LoginPage,
  DashboardPage,
  YourScenariosPage,
  ProgressPage,
  CustomizationPage,
  ExplorePage,
  SignUpPage,
  SettingsPage,
  ScenarioStagePage,
} from "./pages";
import { ModalProvider, ToastProvider, UserProvider } from "./context";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ToastProvider>
          <ModalProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />

                {/* Admin Routes */}
                <Route element={<AdminLayout />}>
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <HomePage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/scenarios"
                    element={
                      <AdminRoute>
                        <ManageScenariosPage />
                      </AdminRoute>
                    }
                  />
                </Route>

                <Route element={<ScenarioLayout />}>
                  <Route
                    path="/scenario/:scenarioId"
                    element={
                      <AdminRoute>
                        <EditScenarioPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/scenario/:scenarioId/dialogue/:dialogueId"
                    element={
                      <AdminRoute>
                        <EditScenarioPage />
                      </AdminRoute>
                    }
                  />
                </Route>

                {/* User Routes */}
                <Route element={<UserLayout />}>
                  <Route
                    path="/"
                    element={
                      <UserRoute>
                        <DashboardPage />
                      </UserRoute>
                    }
                  />
                  <Route
                    path="/your-scenarios"
                    element={
                      <UserRoute>
                        <YourScenariosPage />
                      </UserRoute>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <UserRoute>
                        <ProgressPage />
                      </UserRoute>
                    }
                  />
                  <Route
                    path="/customization"
                    element={
                      <UserRoute>
                        <CustomizationPage />
                      </UserRoute>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <UserRoute>
                        <ExplorePage />
                      </UserRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <UserRoute>
                        <SettingsPage />
                      </UserRoute>
                    }
                  />
                  {/* Add user scenario playing route */}
                  <Route
                    path="/play/:scenarioId"
                    element={
                      <UserRoute>
                        <ScenarioStagePage />
                      </UserRoute>
                    }
                  />
                </Route>
              </Routes>
            </Router>
          </ModalProvider>
        </ToastProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;