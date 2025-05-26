import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user, token } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist from server or local storage
  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Fetch from server if user is logged in
        const response = await axios.get('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setWishlist({
          items: response.data.items || [],
          totalItems: response.data.items.length || 0
        });
      } else {
        // Use local storage for guest users
        const localWishlist = localStorage.getItem('guestWishlist');
        if (localWishlist) {
          setWishlist(JSON.parse(localWishlist));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!product || !product._id) {
        throw new Error('Invalid product');
      }

      if (isAuthenticated) {
        // Add to server wishlist
        const response = await axios.post('/api/wishlist', {
          productId: product._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update wishlist with server response
        setWishlist({
          items: response.data.items || [],
          totalItems: response.data.items.length || 0
        });
      } else {
        // Add to local wishlist
        const updatedWishlist = { ...wishlist };
        const existingItemIndex = updatedWishlist.items.findIndex(item => item._id === product._id);
        
        if (existingItemIndex < 0) {
          // Only add if not already in wishlist
          updatedWishlist.items.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : ''
          });
          
          // Update total
          updatedWishlist.totalItems = updatedWishlist.items.length;
          
          // Save to local storage
          localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
          setWishlist(updatedWishlist);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add item to wishlist');
      console.error('Error adding to wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Remove from server wishlist
        const response = await axios.delete(`/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update wishlist with server response
        setWishlist({
          items: response.data.items || [],
          totalItems: response.data.items.length || 0
        });
      } else {
        // Remove from local wishlist
        const updatedWishlist = { ...wishlist };
        updatedWishlist.items = updatedWishlist.items.filter(item => item._id !== productId);
        
        // Update total
        updatedWishlist.totalItems = updatedWishlist.items.length;
        
        // Save to local storage
        localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
        setWishlist(updatedWishlist);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlist.items.some(item => item._id === productId);
  };

  // Clear wishlist
  const clearWishlist = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Clear server wishlist
        await axios.delete('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Clear local state and storage
      setWishlist({ items: [], totalItems: 0 });
      localStorage.removeItem('guestWishlist');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear wishlist');
      console.error('Error clearing wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Merge local wishlist with server wishlist on login
  const mergeWithServerWishlist = async () => {
    const localWishlist = localStorage.getItem('guestWishlist');
    if (!localWishlist) return;
    
    try {
      const parsedWishlist = JSON.parse(localWishlist);
      if (parsedWishlist.items && parsedWishlist.items.length > 0) {
        setLoading(true);
        
        // Add each local item to server wishlist
        for (const item of parsedWishlist.items) {
          await axios.post('/api/wishlist', {
            productId: item._id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        // Clear local wishlist
        localStorage.removeItem('guestWishlist');
        
        // Fetch updated wishlist from server
        await fetchWishlist();
      }
    } catch (err) {
      console.error('Error merging wishlists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Handle login/logout
  useEffect(() => {
    if (isAuthenticated) {
      mergeWithServerWishlist();
    } else {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      error,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 