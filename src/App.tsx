import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout, ScenarioLayout, TaskBar } from "./components";
import { HomePage, ScenarioPage, ScenariosPage } from "./pages";

function App() {
  return (
    <Router>
      <div className="container">
        <TaskBar />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
          </Route>
          <Route element={<ScenarioLayout />}>
            <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
