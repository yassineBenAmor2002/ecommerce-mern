import React, { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.wishlist.includes(action.payload)) {
        return state; // Item already in wishlist
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
      
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter((id) => id !== action.payload),
      };
      
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
      
    case 'CLEAR_WISHLIST':
      return { ...state, wishlist: [] };
      
    case 'LOAD_WISHLIST':
      return { ...state, wishlist: action.payload };
      
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { wishlist: [] });

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage', error);
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (state.wishlist.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    } else {
      localStorage.removeItem('wishlist');
    }
  }, [state.wishlist]);

  const addToWishlist = (productId) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const toggleWishlist = (productId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (productId) => {
    return state.wishlist.includes(productId);
  };

  const getWishlistCount = () => {
    return state.wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: state.wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
