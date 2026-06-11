import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../store/productsSlice';
import { RootState } from '../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Only categories that exist in the Fake Store API
const API_CATEGORIES = [
  "men's clothing",
  "women's clothing",
  "electronics",
  "jewelery",
];

const TABS = [
  { id: 'category', label: 'Category' },
  { id: 'price', label: 'Price' },
  { id: 'rating', label: 'Rating' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function FilterBottomSheet({ visible, onClose }: FilterBottomSheetProps) {
  const dispatch = useDispatch();
  const activeFilters = useSelector((state: RootState) => state.products.appliedFilters);

  const [activeTab, setActiveTab] = useState<TabId>('category');

  // Local buffer states
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 1000 });
  const [localMinRating, setLocalMinRating] = useState(0);

  // Sync from Redux state when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalCategories(activeFilters.categories);
      setLocalPriceRange({ min: activeFilters.minPrice, max: activeFilters.maxPrice });
      setLocalMinRating(activeFilters.minRating);
      setActiveTab('category');

      backdropOpacity.value = withTiming(0.4, { duration: 250, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    }
  }, [visible, activeFilters]);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const handleApply = () => {
    dispatch(
      setFilters({
        categories: localCategories,
        minPrice: localPriceRange.min,
        maxPrice: localPriceRange.max,
        minRating: localMinRating,
      })
    );
    handleClose();
  };

  const handleClearAll = () => {
    dispatch(resetFilters());
    setLocalCategories([]);
    setLocalPriceRange({ min: 0, max: 1000 });
    setLocalMinRating(0);
    handleClose();
  };

  const toggleCategory = (cat: string) => {
    setLocalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const animatedBackdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Category label prettifier
  const formatCat = (cat: string) =>
    cat
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const renderRightPanelContent = () => {
    switch (activeTab) {
      case 'category':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select category</Text>
            <View className="flex-col gap-2">
              {API_CATEGORIES.map((cat) => {
                const isSelected = localCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => toggleCategory(cat)}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/10'
                        : 'border-slate-100 bg-white'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-brand-primary' : 'text-slate-600'
                      }`}
                    >
                      {formatCat(cat)}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'price':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">
              Select price range (USD)
            </Text>
            <View className="flex-col gap-2">
              {[
                { label: 'All prices', min: 0, max: 1000 },
                { label: 'Under $20', min: 0, max: 20 },
                { label: '$20 – $50', min: 20, max: 50 },
                { label: '$50 – $100', min: 50, max: 100 },
                { label: 'Above $100', min: 100, max: 1000 },
              ].map((preset) => {
                const isSelected =
                  localPriceRange.min === preset.min && localPriceRange.max === preset.max;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => setLocalPriceRange({ min: preset.min, max: preset.max })}
                    className={`p-3 rounded-xl border flex-row justify-between items-center ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/5'
                        : 'border-slate-100 bg-white'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-brand-primary font-bold' : 'text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'rating':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">
              Minimum rating
            </Text>
            <View className="flex-col gap-2">
              {[
                { label: 'All ratings', value: 0 },
                { label: '3★ & above', value: 3 },
                { label: '3.5★ & above', value: 3.5 },
                { label: '4★ & above', value: 4 },
                { label: '4.5★ & above', value: 4.5 },
              ].map((r) => {
                const isSelected = localMinRating === r.value;
                return (
                  <TouchableOpacity
                    key={r.label}
                    onPress={() => setLocalMinRating(r.value)}
                    className={`p-3 rounded-xl border flex-row justify-between items-center ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/5'
                        : 'border-slate-100 bg-white'
                    }`}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-brand-primary font-bold' : 'text-slate-600'
                      }`}
                    >
                      {r.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none">
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View style={[animatedBackdropStyle]} className="absolute inset-0 bg-black" />
        <Pressable className="absolute inset-0" onPress={handleClose} />

        {/* Sheet */}
        <Animated.View
          style={[animatedSheetStyle]}
          className="bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl pt-6 pb-6 h-[65%] flex-col"
        >
          {/* Header */}
          <Text className="text-base font-bold text-brand-primary mb-4 px-6">Filters</Text>

          {/* Two-column layout */}
          <View className="flex-1 flex-row border-t border-slate-100">
            {/* Left sidebar */}
            <View className="w-[120px] bg-slate-50 border-r border-slate-100">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      className={`py-4 px-4 flex-row items-center border-b border-slate-100/50 relative ${
                        isActive ? 'bg-white' : 'bg-slate-50'
                      }`}
                      activeOpacity={0.8}
                    >
                      {isActive && (
                        <View className="absolute left-0 top-0 bottom-0 w-[4.5px] bg-brand-primary" />
                      )}
                      <Text
                        className={`text-xs ${
                          isActive ? 'text-brand-primary font-bold' : 'text-slate-600 font-medium'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right content */}
            <View className="flex-1 bg-white p-5">
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderRightPanelContent()}
              </ScrollView>
            </View>
          </View>

          {/* Footer buttons */}
          <View className="flex-row items-center space-x-4 px-6 pt-4 border-t border-slate-100">
            <TouchableOpacity
              onPress={handleClearAll}
              className="flex-1 py-3 bg-white border border-brand-primary rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-xs font-extrabold text-brand-primary tracking-wide">Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              className="flex-[1.2] py-3 bg-brand-primary rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-xs font-extrabold text-white tracking-wide">Apply filter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
