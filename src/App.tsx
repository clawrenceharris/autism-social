import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskBar } from './components/TaskBar';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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