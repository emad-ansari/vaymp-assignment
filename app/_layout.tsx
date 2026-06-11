import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import "@/global.css";
import { Provider } from "react-redux";
import { store } from "../store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCartState } from "../store/cartSlice";

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function loadCartState() {
      try {
        const stored = await AsyncStorage.getItem('@vaymp_cart_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          store.dispatch(setCartState(parsed));
        }
      } catch (error) {
        console.error('Failed to load cart state:', error);
      } finally {
        setIsHydrated(true);
      }
    }
    loadCartState();
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="bag" options={{ headerShown: false }} />
        <Stack.Screen name="wishlist" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
