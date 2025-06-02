import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Map, List } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header = ({ toggleTheme, currentTheme }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
            <span className="mr-2">⚡</span>
            <span>EV Charger Hub</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/chargers" 
                  className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <List size={18} className="mr-1" />
                  <span>List View</span>
                </Link>
                
                <Link 
                  to="/map" 
                  className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <Map size={18} className="mr-1" />
                  <span>Map View</span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Register
                </Link>
              </div>
            )}
            
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;