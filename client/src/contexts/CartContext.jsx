import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(getLocalCart());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
      setCart(getLocalCart()); // Fallback to local cart
    } finally {
      setLoading(false);
    }
  };

  // Handle local cart for non-authenticated users
  const getLocalCart = () => {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      return JSON.parse(localCart);
    }
    return { items: [], total: 0, itemCount: 0 };
  };

  const saveLocalCart = (cartData) => {
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  // Initialize cart
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    setError(null);
    
    if (!isAuthenticated) {
      try {
        // Get the current local cart
        const localCart = getLocalCart();
        
        // Get product details
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data;
        
        // Check if product is already in cart
        const existingItemIndex = localCart.items.findIndex(
          item => item.product === productId
        );
        
        if (existingItemIndex > -1) {
          // Update quantity if product already in cart
          localCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item to cart
          localCart.items.push({
            product: productId,
            quantity: quantity,
            price: product.salePrice || product.price,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0] : ''
          });
        }
        
        // Calculate totals
        localCart.total = localCart.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        localCart.itemCount = localCart.items.reduce(
          (sum, item) => sum + item.quantity, 0
        );
        
        // Save to localStorage
        saveLocalCart(localCart);
        setCart(localCart);
        
        return { success: true, cart: localCart };
      } catch (err) {
        console.error('Error adding to local cart:', err);
        setError('Failed to add item to cart. Please try again.');
        return { success: false, error: err.message };
      }
    } else {
      try {
        const response = await axios.post('/api/cart', { productId, quantity });
        setCart(response.data);
        return { success: true, cart: response.data };
      } catch (err) {
        console.error('Error adding to cart:', err);
        setError('Failed to add item to cart. Please try again.');
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }
  };

  // Update cart item
  const updateCartItem = async (itemId, quantity) => {
    setError(null);
    
    if (!isAuthenticated) {
      try {
        // Get the current local cart
        const localCart = getLocalCart();
        
        // Find the item
        const itemIndex = localCart.items.findIndex(
          item => item.product === itemId
        );
        
        if (itemIndex === -1) {
          setError('Item not found in cart');
          return { success: false, error: 'Item not found in cart' };
        }
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          localCart.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          localCart.items[itemIndex].quantity = quantity;
        }
        
        // Calculate totals
        localCart.total = localCart.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        localCart.itemCount = localCart.items.reduce(
          (sum, item) => sum + item.quantity, 0
        );
        
        // Save to localStorage
        saveLocalCart(localCart);
        setCart(localCart);
        
        return { success: true, cart: localCart };
      } catch (err) {
        console.error('Error updating local cart:', err);
        setError('Failed to update cart. Please try again.');
        return { success: false, error: err.message };
      }
    } else {
      try {
        const response = await axios.put(`/api/cart/${itemId}`, { quantity });
        setCart(response.data);
        return { success: true, cart: response.data };
      } catch (err) {
        console.error('Error updating cart:', err);
        setError('Failed to update cart. Please try again.');
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setError(null);
    
    if (!isAuthenticated) {
      try {
        // Get the current local cart
        const localCart = getLocalCart();
        
        // Find and remove the item
        const itemIndex = localCart.items.findIndex(
          item => item.product === itemId
        );
        
        if (itemIndex === -1) {
          setError('Item not found in cart');
          return { success: false, error: 'Item not found in cart' };
        }
        
        localCart.items.splice(itemIndex, 1);
        
        // Calculate totals
        localCart.total = localCart.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        localCart.itemCount = localCart.items.reduce(
          (sum, item) => sum + item.quantity, 0
        );
        
        // Save to localStorage
        saveLocalCart(localCart);
        setCart(localCart);
        
        return { success: true, cart: localCart };
      } catch (err) {
        console.error('Error removing from local cart:', err);
        setError('Failed to remove item from cart. Please try again.');
        return { success: false, error: err.message };
      }
    } else {
      try {
        const response = await axios.delete(`/api/cart/${itemId}`);
        setCart(response.data.cart);
        return { success: true, message: response.data.message };
      } catch (err) {
        console.error('Error removing from cart:', err);
        setError('Failed to remove item from cart. Please try again.');
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    setError(null);
    
    if (!isAuthenticated) {
      try {
        // Clear local cart
        const emptyCart = { items: [], total: 0, itemCount: 0 };
        saveLocalCart(emptyCart);
        setCart(emptyCart);
        return { success: true, cart: emptyCart };
      } catch (err) {
        console.error('Error clearing local cart:', err);
        setError('Failed to clear cart. Please try again.');
        return { success: false, error: err.message };
      }
    } else {
      try {
        const response = await axios.delete('/api/cart');
        setCart(response.data.cart);
        return { success: true, message: response.data.message };
      } catch (err) {
        console.error('Error clearing cart:', err);
        setError('Failed to clear cart. Please try again.');
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }
  };

  // Merge local cart with server cart on login
  const mergeWithServerCart = async () => {
    if (!isAuthenticated) return;
    
    const localCart = getLocalCart();
    
    if (!localCart.items || localCart.items.length === 0) {
      // No local items to merge, just fetch the server cart
      fetchCart();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Add each local item to the server cart
      for (const item of localCart.items) {
        await axios.post('/api/cart', {
          productId: item.product,
          quantity: item.quantity
        });
      }
      
      // Clear local cart
      localStorage.removeItem('cart');
      
      // Fetch the updated server cart
      await fetchCart();
    } catch (err) {
      console.error('Error merging carts:', err);
      setError('Failed to sync your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When user logs in, merge local cart with server cart
    if (isAuthenticated && user) {
      mergeWithServerCart();
    }
  }, [isAuthenticated, user]);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 