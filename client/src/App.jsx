import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import AddBlog from './pages/AddBlog';
import EditBlog from './pages/EditBlog';
import Profile from './pages/Profile';
import Services from './pages/Services';
import PrivateRoute from './routes/PrivateRoute';
import EditProfile from './pages/EditProfile';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import CustomCursor from './components/CustomCursor';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PetShopDetail from './pages/PetShopDetail';

// Protected Route Component
const ProtectedRoute = ({ children, requiresAuth = true, requiresBusiness = false }) => {
  const { user, isAuthenticated } = useAuth();

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiresBusiness && (!user || user.userType !== 'business')) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CustomCursor />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route path="/pets/add" element={
              <ProtectedRoute requiresBusiness>
                <AddPet />
              </ProtectedRoute>
            } />
            <Route path="/pets/:id/edit" element={
              <ProtectedRoute requiresBusiness>
                <EditPet />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/blogs/add" element={
              <ProtectedRoute>
                <AddBlog />
              </ProtectedRoute>
            } />
            <Route path="/blogs/:id/edit" element={
              <ProtectedRoute>
                <EditBlog />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            <Route path="/shop/:id" element={<PetShopDetail />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
