import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScenarioLayout, RootLayout, UserRoute } from "./components";
import {
  LoginPage,
  DashboardPage,
  ScenariosPage,
  ProgressPage,
  SignUpPage,
  SettingsPage,
  PlayScenarioPage,
  DailyChallengesPage,
  LandingPage,
} from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* User Routes */}
        <Route element={<RootLayout />}>
          <Route element={<UserRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/daily-challenges" element={<DailyChallengesPage />} />
          </Route>
        </Route>

        <Route element={<ScenarioLayout />}>
          <Route element={<UserRoute />}>
            <Route
              path="/scenario/:scenarioId/dialogue/:dialogueId"
              element={<PlayScenarioPage />}
            />
            <Route
              path="/scenario/:scenarioId"
              element={<PlayScenarioPage />}
            />

            <Route
              path="/enhanced/:scenarioId"
              element={<PlayScenarioPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
