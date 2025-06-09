import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token in localStorage, setting up axios and fetching user');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser().catch(err => {
        console.error('Error fetching user:', err);
        // If token is invalid, clear it
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
        }
      });
    } else {
      console.log('No token found in localStorage');
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      const response = await axios.get('/api/auth/user');
      console.log('User data received:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, logging out');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      }
      setError(error.response?.data?.message || 'Failed to fetch user data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login...');
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('Attempting to register with:', userData);
      
      // Set the correct content type for FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post('/api/auth/register', userData, config);
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      // Store token and set up axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update auth state
      setUser(user);
      setIsAuthenticated(true);
      
      // Fetch user data to ensure we have the complete user object
      await fetchUser();
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Registration failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Add this function to update user data in context
  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      return {
        ...prevUser,
        ...updatedUserData,
        address: {
          ...prevUser.address,
          ...updatedUserData.address
        }
      };
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 