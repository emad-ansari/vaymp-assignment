import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface FilterSortBarProps {
  onSortPress: () => void;
  onFilterPress: () => void;
  isVisible: boolean;
  activeFilterCount: number;
}

export default function FilterSortBar({
  onSortPress,
  onFilterPress,
  isVisible,
  activeFilterCount,
}: FilterSortBarProps) {
  // Shared value for Y translation
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Animate position when visibility changes (timing-based, no damping)
    translateY.value = withTiming(isVisible ? 0 : 90, {
      duration: 300,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: withTiming(isVisible ? 1 : 0, { duration: 250 }),
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute bottom-6 left-0 right-0 items-center justify-center z-30"
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <View className="flex-row items-center w-[250px] h-12 bg-white/95 border border-slate-100 rounded-full shadow-lg shadow-slate-300 px-1">
        
        {/* Sort Section */}
        <TouchableOpacity
          onPress={onSortPress}
          className="flex-1 flex-row items-center justify-center h-full"
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={16} color="#4f46e5" className="mr-1.5" />
          <Text className="text-slate-800 text-xs font-semibold tracking-wide">Sort by</Text>
        </TouchableOpacity>

        {/* Separator Divider Line */}
        <View className="w-[1px] h-6 bg-slate-200" />

        {/* Filter Section */}
        <TouchableOpacity
          onPress={onFilterPress}
          className="flex-1 flex-row items-center justify-center h-full relative"
          activeOpacity={0.7}
        >
          <Ionicons name="options" size={16} color="#4f46e5" className="mr-1.5" />
          <Text className="text-slate-800 text-xs font-semibold tracking-wide">Filters</Text>
          
          {/* Active Filter Badge / Blue Dot Indicator */}
          {activeFilterCount > 0 && (
            <View className="absolute top-2.5 right-7 w-2.5 h-2.5 bg-brand-primary rounded-full border border-white" />
          )}
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
}
