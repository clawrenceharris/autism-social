import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout, ScenarioLayout } from "./components";
import { HomePage, ScenarioPage, ScenariosPage } from "./pages";
import { ModalProvider } from "./context";

function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
          </Route>
          <Route element={<ScenarioLayout />}>
            <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
            <Route
              path="/scenario/:scenarioId/dialogue/:dialogueId"
              element={<ScenarioPage />}
            />
          </Route>
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
