import "./styles/global.css";
import { Route, Routes } from "react-router-dom";
import { Dashboard, Scenarios, Scenario } from "./pages";
import { RootLayout, StageLayout } from "./components";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/progress" element={<Dashboard />} />
        <Route path="/customize" element={<Dashboard />} />
      </Route>
      <Route element={<StageLayout />}>
        <Route path="/scenario/:id" element={<Scenario />} />
      </Route>
    </Routes>
  );
}

export default App;
