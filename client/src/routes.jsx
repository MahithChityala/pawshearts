import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Blog from './pages/Blog';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import BlogDetail from './pages/BlogDetail';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import EditProfile from './pages/EditProfile';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import { useAuth } from './contexts/AuthContext';
import AddBlog from './pages/AddBlog';
import EditBlog from './pages/EditBlog';
import AdoptionRequests from './pages/AdoptionRequests';

// Business Route component
const BusinessRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.userType === 'business' ? children : <Navigate to="/profile" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pets" element={<Pets />} />
      <Route path="/pet/:id" element={<PetDetail />} />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/edit-profile" 
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route 
        path="/add-pet" 
        element={
          <BusinessRoute>
            <AddPet />
          </BusinessRoute>
        } 
      />
      <Route 
        path="/edit-pet/:id" 
        element={
          <BusinessRoute>
            <EditPet />
          </BusinessRoute>
        } 
      />
      <Route
        path="/add-blog"
        element={
          <PrivateRoute>
            <AddBlog />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-blog/:id"
        element={
          <PrivateRoute>
            <EditBlog />
          </PrivateRoute>
        }
      />
      <Route
        path="/adoption-requests"
        element={
          <PrivateRoute>
            <AdoptionRequests />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes; 