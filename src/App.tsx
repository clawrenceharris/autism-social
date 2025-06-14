import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ScenarioLayout,
  ScenarioRoute,
  UserLayout,
  UserRoute,
} from "./components";
import {
  LoginPage,
  DashboardPage,
  YourScenariosPage,
  ProgressPage,
  SignUpPage,
  SettingsPage,
  PlayScenarioPage,
  DailyChallengesPage,
} from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* User Routes */}
        <Route element={<UserLayout />}>
          <Route element={<UserRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/your-scenarios" element={<YourScenariosPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/daily-challenges" element={<DailyChallengesPage />} />
          </Route>
        </Route>

        <Route element={<ScenarioLayout />}>
          <Route element={<ScenarioRoute />}>
            <Route element={<UserRoute />}>
              <Route
                path="/scenario/:scenarioId/dialogue/:dialogueId"
                element={<PlayScenarioPage />}
              />
              <Route
                path="/scenario/:scenarioId"
                element={<PlayScenarioPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
