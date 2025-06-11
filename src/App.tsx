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
  ExplorePage,
  SignUpPage,
  SettingsPage,
  PlayScenarioPage,
  DailyChallengesPage,
} from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Hello</div>} />
      </Routes>
    </Router>
  );
}

export default App;
