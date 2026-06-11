import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, Keyboard, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../store/productsSlice';
import { RootState } from '../store/store';
import { selectCartItemsCount } from '../store/cartSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
}

export default function Header({ title = 'T-shirts', onBackPress }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const router = useRouter();
  const cartCount = useSelector(selectCartItemsCount);
  const searchQuery = useSelector((state: RootState) => state.products.searchQuery);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  // Animation values
  const searchBarWidth = useSharedValue(0);
  const headerContentOpacity = useSharedValue(1);

  // Sync state with UI animation
  const maxSearchWidth = SCREEN_WIDTH - 48; // Leaves room for close button / margins

  const handleSearchPress = () => {
    setIsSearchActive(true);
    headerContentOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
    searchBarWidth.value = withTiming(maxSearchWidth, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    }, () => {
      runOnJS(focusInput)();
    });
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    dispatch(setSearchQuery(''));
    searchBarWidth.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    }, () => {
      runOnJS(setIsSearchActive)(false);
    });
    headerContentOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  };

  // Reanimated style definitions
  const animatedSearchStyle = useAnimatedStyle(() => {
    return {
      width: searchBarWidth.value,
      opacity: searchBarWidth.value > 0 ? 1 : 0,
    };
  });

  const animatedHeaderContentStyle = useAnimatedStyle(() => {
    return {
      opacity: headerContentOpacity.value,
      transform: [
        { translateX: withTiming((1 - headerContentOpacity.value) * -20, { duration: 200 }) }
      ],
    };
  });

  return (
    <View 
      className="bg-brand-headerBg border-b border-slate-100 shadow-sm"
      style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between px-4 h-10 relative">
        
        {/* Animated Search Bar (Overlay) */}
        {isSearchActive && (
          <Animated.View 
            style={[animatedSearchStyle]} 
            className="absolute left-4 right-4 h-10 flex-row items-center bg-white border border-slate-200 rounded-full px-3 z-10"
          >
            <Ionicons name="search" size={18} color="#64748b" />
            <TextInput
              ref={inputRef}
              className="flex-1 ml-2 text-slate-800 text-sm py-0 font-medium"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChangeText={(text) => dispatch(setSearchQuery(text))}
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleCloseSearch} className="p-1">
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Normal Header Content */}
        <Animated.View 
          style={[animatedHeaderContentStyle]}
          className="flex-1 flex-row items-center justify-between"
          pointerEvents={isSearchActive ? 'none' : 'auto'}
        >
          {/* Left Actions */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="mr-3 p-1">
              <Ionicons name="chevron-back" size={26} color="#0f172a" />
            </TouchableOpacity>
            
            {/* Brand Logo & Name */}
            <View className="flex-row items-center">
              {/* App Logo Asset */}
              <Image 
                source={require('../assets/images/app-logo.png')} 
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
                className="mr-2"
              />
              <Text className="text-xl font-bold text-slate-900 tracking-tight">{title}</Text>
            </View>
          </View>

          {/* Right Actions */}
          <View className="flex-row items-center space-x-1">
            <TouchableOpacity onPress={handleSearchPress} className="p-2">
              <Ionicons name="search-outline" size={23} color="#0f172a" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/wishlist')} className="p-2">
              <Ionicons name="heart-outline" size={23} color="#0f172a" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/bag')} className="p-2 relative ml-1">
              <Feather name="shopping-bag" size={21} color="#0f172a" />
              {cartCount > 0 && (
                <View className="absolute -top-0.5 -right-0.5 bg-brand-primary rounded-full min-w-[16px] h-4 px-1 items-center justify-center border border-white">
                  <Text className="text-[9px] font-bold text-white text-center leading-3">{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

      </View>
    </View>
  );
}
