import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Pressable, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, addToCart, selectCartItemsCount } from '../store/cartSlice';
import { LOCAL_IMAGES } from '../constants/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';

export default function WishlistScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  // Select state from Redux
  const favorites = useSelector((state: RootState) => state.cart.favorites);
  const products = useSelector((state: RootState) => state.products.items);
  const cartCount = useSelector(selectCartItemsCount);

  // Map wishlist IDs to actual product objects
  const wishlistedProducts = products.filter(product => favorites.includes(product.id));

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="bg-slate-50 p-6 rounded-full mb-4">
        <Ionicons name="heart-dislike-outline" size={48} color="#cbd5e1" />
      </View>
      <Text className="text-xl font-bold text-slate-900">Your Wishlist is empty</Text>
      <Text className="text-sm text-slate-400 text-center mt-2 mb-8 max-w-[280px]">
        Explore our curated products and tap the heart icon to save your favorite items here!
      </Text>
      <TouchableOpacity 
        onPress={() => router.replace('/')}
        className="bg-brand-primary w-full max-w-[280px] py-3.5 rounded-full items-center justify-center shadow-md shadow-slate-200"
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-sm">Explore products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 flex-col" style={{ paddingTop: Math.max(insets.top, 12) }}>
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 h-12 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={26} color="#0f172a" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-slate-900">Wishlist</Text>
        
        <TouchableOpacity onPress={() => router.push('/bag')} className="p-2 relative">
          <Feather name="shopping-bag" size={21} color="#0f172a" />
          {cartCount > 0 && (
            <View className="absolute -top-0.5 -right-0.5 bg-brand-primary rounded-full min-w-[16px] h-4 px-1 items-center justify-center border border-white">
              <Text className="text-[9px] font-bold text-white text-center leading-3">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {wishlistedProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistedProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 12,
            paddingBottom: 30,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between'
          }}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 40).duration(400).easing(Easing.out(Easing.quad))}
              className="flex-1 m-1.5 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex-col justify-between"
            >
              {/* Product Image Wrapper */}
              <View className="relative w-full aspect-[3/4] bg-slate-50">
                <Image
                  source={LOCAL_IMAGES[item.imageIndex]}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                
                {/* Remove from wishlist button */}
                <TouchableOpacity 
                  onPress={() => dispatch(toggleFavorite(item.id))}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm"
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={16} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Product Metadata & Quick Actions */}
              <View className="p-3 flex-col">
                <Text className="text-sm font-bold text-slate-800 leading-4" numberOfLines={1}>
                  {item.brand}
                </Text>
                
                <Text className="text-xs text-slate-400 font-medium leading-4 mt-0.5 mb-2" numberOfLines={1}>
                  {item.title}
                </Text>

                <View className="flex-row items-center space-x-1.5 mb-3">
                  <Text className="text-sm font-extrabold text-slate-900">₹{item.price}</Text>
                  <Text className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</Text>
                  <Text className="text-[10px] text-brand-discount font-bold">{item.discountPercent}% OFF</Text>
                </View>

                {/* Add to Bag Quick Button */}
                <TouchableOpacity
                  onPress={() => dispatch(addToCart(item.id))}
                  className="w-full py-2.5 bg-brand-primary rounded-xl items-center justify-center flex-row shadow-sm shadow-indigo-150"
                  activeOpacity={0.8}
                >
                  <Feather name="shopping-bag" size={12} color="white" className="mr-1.5" />
                  <Text className="text-white font-bold text-xs">Add to Bag</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
