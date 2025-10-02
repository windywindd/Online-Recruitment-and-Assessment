import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png'; // adjust path

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-black text-white p-4 flex items-center justify-between">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
        <span className="text-2xl font-bold">Recruitify</span>
      </Link>

      {/* Center: Nav links */}
      {user && (
        <div className="flex space-x-6 mx-auto">
          <Link to="/jobs" className="hover:text-gray-300">Jobs</Link>
          <Link to="/post-job" className="hover:text-gray-300">Post New Job</Link>
          <Link to="/profile" className="hover:text-gray-300">Profile</Link>
        </div>
      )}

      {/* Right: Logout or login/register */}
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:text-gray-300">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
