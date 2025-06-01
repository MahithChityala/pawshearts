import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Blogs from './pages/Blogs';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import BlogDetails from './pages/BlogDetails';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import EditRegularProfile from './pages/EditRegularProfile';
import EditBusinessProfile from './pages/EditBusinessProfile';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import { useAuth } from './contexts/AuthContext';
import AddBlog from './pages/AddBlog';
import EditBlog from './pages/EditBlog';
import AdoptionRequests from './pages/AdoptionRequests';
import Services from './pages/Services';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import PetShopDetail from './pages/PetShopDetail';

// Business Route component
const BusinessRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.userType === 'business' ? children : <Navigate to="/profile" />;
};

// Edit Profile Route component
const EditProfileRoute = () => {
  const { user } = useAuth();
  return user?.userType === 'business' ? <EditBusinessProfile /> : <EditRegularProfile />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pets" element={<Pets />} />
      <Route path="/pets/:id" element={<PetDetail />} />
      <Route path="/services" element={<Services />} />
      <Route path="/communities" element={<Communities />} />
      <Route path="/community/:id" element={<CommunityDetail />} />
      <Route path="/shop/:id" element={<PetShopDetail />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/edit-profile" element={<PrivateRoute><EditProfileRoute /></PrivateRoute>} />
      <Route path="/add-pet" element={<PrivateRoute requiresBusiness><AddPet /></PrivateRoute>} />
      <Route path="/edit-pet/:id" element={<PrivateRoute requiresBusiness><EditPet /></PrivateRoute>} />
      <Route path="/add-blog" element={<PrivateRoute><AddBlog /></PrivateRoute>} />
      <Route path="/edit-blog/:id" element={<PrivateRoute><EditBlog /></PrivateRoute>} />
      <Route path="/blogs/:id" element={<BlogDetails />} />
      <Route path="/adoption-requests" element={<PrivateRoute><AdoptionRequests /></PrivateRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes; 