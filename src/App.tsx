import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout, TaskBar } from "./components";
import { HomePage, Scenarios } from "./pages";

function App() {
  return (
    <Router>
      <div className="container">
        <TaskBar />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scenarios" element={<Scenarios />} />
          </Route>
          {/* Other routes will be added later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
