import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, addToCart } from '../store/cartSlice';
import { RootState } from '../store/store';
import { Product } from '../store/productsSlice';

interface ProductCardProps {
  item: Product;
  index: number;
}

// Make category label prettier
const formatCategory = (cat: string) =>
  cat
    .split("'")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("'");

export default function ProductCard({ item, index }: ProductCardProps) {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.cart.favorites);
  const isFavorite = favorites.includes(item.id);

  const heartScale = useSharedValue(1);
  const bagScale = useSharedValue(1);

  const handleFavoritePress = () => {
    dispatch(toggleFavorite(item.id));
    heartScale.value = withTiming(1.3, { duration: 120, easing: Easing.bezier(0.25, 1, 0.5, 1) }, () => {
      heartScale.value = withTiming(1, { duration: 120, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    });
  };

  const handleAddToBag = () => {
    dispatch(addToCart(item.id));
    bagScale.value = withTiming(1.25, { duration: 120, easing: Easing.bezier(0.25, 1, 0.5, 1) }, () => {
      bagScale.value = withTiming(1, { duration: 120, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    });
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const animatedBagStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bagScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400).easing(Easing.out(Easing.quad))}
      className="flex-1 m-1.5 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex-col"
    >
      {/* Product Image */}
      <View className="relative w-full aspect-square bg-slate-50">
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={300}
        />

        {/* Heart Favourite Toggle */}
        <Pressable
          onPress={handleFavoritePress}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 rounded-full shadow-sm"
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <Animated.View style={[animatedHeartStyle]}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#ef4444' : '#475569'}
            />
          </Animated.View>
        </Pressable>

        {/* Rating badge */}
        <View className="absolute bottom-2 left-2 flex-row items-center bg-white/90 rounded-full px-2 py-0.5 shadow-sm">
          <Ionicons name="star" size={10} color="#f59e0b" />
          <Text className="text-[10px] font-bold text-slate-700 ml-0.5">
            {item.rating.rate}
          </Text>
        </View>
      </View>

      {/* Product Metadata */}
      <View className="p-3 flex-1 flex-col justify-between">
        <View>
          {/* Category pill */}
          <View className="mb-1 self-start bg-slate-100 rounded-full px-2 py-0.5">
            <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              {formatCategory(item.category)}
            </Text>
          </View>

          {/* Title */}
          <Text
            className="text-xs text-slate-800 font-semibold leading-4"
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>

        {/* Price row + Add to Bag */}
        <View className="mt-2.5 flex-row items-center justify-between">
          <View className="flex-1 mr-1.5">
            <Text className="text-base font-extrabold text-slate-900">
              ${item.price.toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="star-outline" size={10} color="#94a3b8" />
              <Text className="text-[10px] text-slate-400 font-medium ml-0.5">
                {item.rating.count} reviews
              </Text>
            </View>
          </View>

          {/* Add to Bag button */}
          <TouchableOpacity onPress={handleAddToBag} activeOpacity={0.8} className="shadow-sm shadow-slate-200">
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
