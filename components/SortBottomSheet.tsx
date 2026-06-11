import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSort } from '../store/productsSlice';
import { RootState } from '../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SortBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest arrivals' },
  { id: 'price_asc', label: 'Price - low to high' },
  { id: 'price_desc', label: 'Price - high to low' },
  { id: 'popularity', label: 'Best sellers' },
] as const;

export default function SortBottomSheet({ visible, onClose }: SortBottomSheetProps) {
  const dispatch = useDispatch();
  const currentSort = useSelector((state: RootState) => state.products.selectedSort);

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(0.4, { duration: 250, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    }
  }, [visible]);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const handleSelectOption = (optionId: typeof SORT_OPTIONS[number]['id']) => {
    dispatch(setSelectedSort(optionId));
    handleClose();
  };

  // Styles
  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View className="flex-1 justify-end">
        {/* Semi-transparent backdrop */}
        <Animated.View style={[animatedBackdropStyle]} className="absolute inset-0 bg-black" />
        <Pressable className="absolute inset-0" onPress={handleClose} />

        {/* Bottom Sheet Content */}
        <Animated.View
          style={[animatedSheetStyle]}
          className="bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl px-6 pt-6 pb-10 max-h-[380px]"
        >
          {/* Header Title in Blue */}
          <Text className="text-base font-bold text-brand-primary mb-6 px-1">
            Sort by
          </Text>

          {/* List of text-only options matching the screenshot */}
          <View className="flex-col">
            {SORT_OPTIONS.map((option) => {
              const isSelected = currentSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelectOption(option.id)}
                  className="py-3.5 px-1 border-b border-slate-50 flex-row items-center active:opacity-60"
                  activeOpacity={0.6}
                >
                  <Text 
                    className={`text-sm tracking-wide ${
                      isSelected 
                        ? 'text-brand-primary font-bold' 
                        : 'text-slate-700 font-medium'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
