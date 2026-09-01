import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id && i.variant?.id === item.variant?.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id && i.variant?.id === item.variant?.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id, variantId) => {
    setCartItems(prev => prev.filter(i => !(i.id === id && i.variant?.id === variantId)));
  };

  const updateQuantity = (id, variantId, quantity) => {
    setCartItems(prev => prev.map(i => 
      i.id === id && i.variant?.id === variantId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setCartItems([]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      itemCount,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);