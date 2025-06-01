import { Link } from 'react-router-dom';
import { Home, FolderOpen, Settings } from 'lucide-react';

export function TaskBar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 hover:text-gray-300">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/scenarios" className="flex items-center space-x-2 hover:text-gray-300">
            <FolderOpen size={20} />
            <span>Scenarios</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-2 hover:text-gray-300">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}