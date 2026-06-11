import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});

let lastCartState: any = null;

store.subscribe(() => {
  const state = store.getState();
  const currentCartState = state.cart;
  if (currentCartState !== lastCartState) {
    lastCartState = currentCartState;
    AsyncStorage.setItem('@vaymp_cart_state', JSON.stringify(currentCartState))
      .catch((err) => {
        console.error('Error saving cart state:', err);
      });
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
