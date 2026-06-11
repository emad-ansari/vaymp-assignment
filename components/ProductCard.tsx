import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, addToCart } from '../store/cartSlice';
import { RootState } from '../store/store';
import { Product } from '../store/productsSlice';
import { LOCAL_IMAGES } from '../constants/images';

interface ProductCardProps {
  item: Product;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.cart.favorites);
  const isFavorite = favorites.includes(item.id);

  // Animation values
  const heartScale = useSharedValue(1);
  const bagScale = useSharedValue(1);

  const handleFavoritePress = () => {
    dispatch(toggleFavorite(item.id));
    heartScale.value = withTiming(1.3, {
      duration: 120,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    }, () => {
      heartScale.value = withTiming(1, {
        duration: 120,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    });
  };

  const handleAddToBag = () => {
    dispatch(addToCart(item.id));
    bagScale.value = withTiming(1.25, {
      duration: 120,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    }, () => {
      bagScale.value = withTiming(1, {
        duration: 120,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    });
  };

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  const animatedBagStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bagScale.value }],
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400).easing(Easing.out(Easing.quad))}
      className="flex-1 m-1.5 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex-col"
    >
      {/* Product Image Wrapper */}
      <View className="relative w-full aspect-[3/4] bg-slate-50">
        <Image
          source={LOCAL_IMAGES[item.imageIndex]}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        
        {/* Heart Icon Toggle */}
        <Pressable 
          onPress={handleFavoritePress} 
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm"
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <Animated.View style={[animatedHeartStyle]}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#ef4444" : "#475569"}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Product Metadata */}
      <View className="p-3 flex-1 flex-col justify-between">
        <View>
          {/* Brand Name */}
          <Text className="text-base font-bold text-slate-800 leading-5" numberOfLines={1}>
            {item.brand}
          </Text>
          
          {/* Product Title */}
          <Text className="text-xs text-slate-500 font-medium mt-0.5 leading-4" numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        {/* Pricing Area & Add to Bag Row */}
        <View className="mt-2.5 flex-row items-end justify-between">
          <View className="flex-1 mr-1.5">
            {/* Price & Try N Buy Row */}
            <View className="flex-row items-center justify-between flex-wrap">
              <Text className="text-base font-extrabold text-slate-900">
                ₹{item.price}
              </Text>
              
              {/* Try N Buy Badge */}
              <View className="flex-row items-center bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                <Text className="text-[7px] font-bold text-slate-400 uppercase">TRY </Text>
                <Text className="text-[8px] font-black text-brand-primary">N</Text>
                <Text className="text-[7px] font-bold text-slate-400 uppercase"> BUY</Text>
              </View>
            </View>

            {/* Original Price & Discount Percent */}
            <View className="flex-row items-center space-x-1.5 mt-0.5">
              <Text className="text-xs text-slate-400 line-through font-medium">
                ₹{item.originalPrice}
              </Text>
              <Text className="text-xs text-brand-discount font-bold">
                {item.discountPercent}% OFF
              </Text>
            </View>
          </View>

          {/* Add to Bag Action Button */}
          <TouchableOpacity
            onPress={handleAddToBag}
            activeOpacity={0.8}
            className="shadow-sm shadow-slate-200"
          >
            <Animated.View 
              style={[animatedBagStyle]} 
              className="bg-brand-primary p-2 rounded-full items-center justify-center"
            >
              <Ionicons name="bag-add" size={17} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
