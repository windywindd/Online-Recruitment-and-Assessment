import React, { createContext, useState, useContext, useEffect } from 'react'; // Import React 

// Create context
const AuthContext = createContext();

// Provide context to app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // track user data is being restored

    //Restore user from storage on app start
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user"); // Get saved user from session
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // Set user state if valid data found
      } catch {
        sessionStorage.removeItem("user"); //  Remove invalid data
      }
    }
      setLoading(false); // Mark loading as complete
  }, []); //Run only once when component mounts

  // Login function: save token & user info
  const login = (data) => {
    // Save token for axios interceptor
    sessionStorage.setItem('token', data.token);//Save login token

  // Save user info in state, including role
 const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role, // <-- store role here
      token: data.token, // optional, if you want to keep token in context
    };

    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData)); // Save user details
  };

  // Optional logout function clears token & user
  const logout = () => {
    sessionStorage.removeItem('token'); // Remove login token from session
    sessionStorage.removeItem("user"); // Remove saved user details from session storage  
    setUser(null);
  };

  if (loading) return <div>Loading...</div>; // Show loading screen until user data is restored
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context easily
export const useAuth = () => useContext(AuthContext);
