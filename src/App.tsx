import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskBar } from './components';
import { HomePage } from './pages';

function App() {
  return (
    <Router>
      <div className="container">
        <TaskBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Other routes will be added later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;