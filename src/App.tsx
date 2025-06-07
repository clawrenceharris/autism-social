import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AdminRoute,
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<HomePage />} />
          <Route path="/scenarios" element={<ManageScenariosPage />} />

          <Route element={<ScenarioLayout />}>
            <Route
              path="/scenario/:scenarioId"
              element={<EditScenarioPage />}
            />
            <Route
              path="/scenario/:scenarioId/dialogue/:dialogueId"
              element={<EditScenarioPage />}
            />
          </Route>
        </Route>

        {/* User Routes */}
        <Route element={<UserRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/your-scenarios" element={<YourScenariosPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/customization" element={<CustomizationPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route element={<ScenarioLayout />}>
            
              <Route path="/play/:scenarioId" element={<ScenarioStagePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
