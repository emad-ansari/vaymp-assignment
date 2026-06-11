import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: number;
  quantity: number;
  selected: boolean;
}

interface CartState {
  favorites: number[]; // Array of product IDs that are favorited
  cartItems: CartItem[]; // Detailed shopping bag items
}

const initialState: CartState = {
  favorites: [],
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const index = state.favorites.indexOf(productId);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(productId);
      }
    },
    addToCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const existingItem = state.cartItems.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ productId, quantity: 1, selected: true });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const existingItem = state.cartItems.find(item => item.productId === productId);
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          // If quantity is 1, remove item completely (mimicking trash icon action)
          state.cartItems = state.cartItems.filter(item => item.productId !== productId);
        }
      }
    },
    deleteFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(item => item.productId !== productId);
    },
    toggleItemSelect: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const existingItem = state.cartItems.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.selected = !existingItem.selected;
      }
    },
    toggleAllItemsSelect: (state, action: PayloadAction<boolean>) => {
      state.cartItems.forEach(item => {
        item.selected = action.payload;
      });
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    setCartState: (state, action: PayloadAction<{ favorites?: number[]; cartItems?: CartItem[] }>) => {
      if (action.payload) {
        state.favorites = action.payload.favorites || [];
        state.cartItems = action.payload.cartItems || [];
      }
    },
  },
});

export const {
  toggleFavorite,
  addToCart,
  removeFromCart,
  deleteFromCart,
  toggleItemSelect,
  toggleAllItemsSelect,
  clearCart,
  setCartState
} = cartSlice.actions;

// Helper to select dynamic badge count (sum of all quantities in cart)
export const selectCartItemsCount = (state: { cart: CartState }) => {
  return state.cart.cartItems.reduce((total, item) => total + item.quantity, 0);
};

export default cartSlice.reducer;
