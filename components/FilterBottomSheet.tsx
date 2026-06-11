import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../store/productsSlice';
import { RootState } from '../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'suggested', label: 'Suggested fliters' },
  { id: 'new_arrivals', label: 'New arrivals' },
  { id: 'gender', label: 'Gender' },
  { id: 'price', label: 'Price' },
  { id: 'brand', label: 'Brand' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'fit', label: 'Fit' },
  { id: 'size', label: 'Size' },
  { id: 'color', label: 'Color' },
  { id: 'discounts', label: 'Discounts' },
  { id: 'delivery_time', label: 'Delivery time' },
] as const;

export default function FilterBottomSheet({ visible, onClose }: FilterBottomSheetProps) {
  const dispatch = useDispatch();
  const activeFilters = useSelector((state: RootState) => state.products.appliedFilters);

  // Active category tab state
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('suggested');

  // Local states buffering selections before Apply is clicked
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 10000 });
  const [localMinRating, setLocalMinRating] = useState(0);
  const [localGenders, setLocalGenders] = useState<string[]>([]);
  const [localDeliveryDays, setLocalDeliveryDays] = useState<number | null>(null);
  const [localColors, setLocalColors] = useState<string[]>([]);
  const [localDiscountMin, setLocalDiscountMin] = useState<number | null>(null);
  const [localBrands, setLocalBrands] = useState<string[]>([]);

  // Reset/sync local buffers when bottom sheet opens
  useEffect(() => {
    if (visible) {
      setLocalCategories(activeFilters.categories);
      setLocalPriceRange({ min: activeFilters.minPrice, max: activeFilters.maxPrice });
      setLocalMinRating(activeFilters.minRating);
      setLocalGenders(activeFilters.genders);
      setLocalDeliveryDays(activeFilters.deliveryDays);
      setLocalColors(activeFilters.colors);
      setLocalDiscountMin(activeFilters.discountMin);
      setLocalBrands(activeFilters.brands);

      // Reset active tab to first
      setActiveTab('suggested');

      // Animate entry (no damping)
      backdropOpacity.value = withTiming(0.4, { duration: 250, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    }
  }, [visible, activeFilters]);

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const handleApply = () => {
    dispatch(
      setFilters({
        categories: localCategories,
        minPrice: localPriceRange.min,
        maxPrice: localPriceRange.max,
        minRating: localMinRating,
        genders: localGenders,
        deliveryDays: localDeliveryDays,
        colors: localColors,
        discountMin: localDiscountMin,
        brands: localBrands,
      })
    );
    handleClose();
  };

  const handleClearAll = () => {
    dispatch(resetFilters());
    setLocalCategories([]);
    setLocalPriceRange({ min: 0, max: 10000 });
    setLocalMinRating(0);
    setLocalGenders([]);
    setLocalDeliveryDays(null);
    setLocalColors([]);
    setLocalDiscountMin(null);
    setLocalBrands([]);
    handleClose();
  };

  // Toggle helpers
  const toggleGender = (gender: string) => {
    setLocalGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const toggleColor = (color: string) => {
    setLocalColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleBrand = (brand: string) => {
    setLocalBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (cat: string) => {
    setLocalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Reanimated styling
  const animatedBackdropStyle = useAnimatedStyle(() => {
    return { opacity: backdropOpacity.value };
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: translateY.value }] };
  });

  // Render content depending on active sidebar tab
  const renderRightPanelContent = () => {
    switch (activeTab) {
      case 'suggested':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">
              Choose from the mostly used filters
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {/* 2 days delivery */}
              <TouchableOpacity
                onPress={() => setLocalDeliveryDays(localDeliveryDays === 2 ? null : 2)}
                className={`px-4 py-2.5 rounded-full border ${
                  localDeliveryDays === 2
                    ? 'border-brand-primary bg-indigo-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${localDeliveryDays === 2 ? 'text-brand-primary' : 'text-slate-600'}`}>
                  2 days delivery
                </Text>
              </TouchableOpacity>

              {/* Brown Color */}
              <TouchableOpacity
                onPress={() => toggleColor('Brown')}
                className={`px-4 py-2.5 rounded-full border ${
                  localColors.includes('Brown')
                    ? 'border-brand-primary bg-indigo-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${localColors.includes('Brown') ? 'text-brand-primary' : 'text-slate-600'}`}>
                  Brown
                </Text>
              </TouchableOpacity>

              {/* Under ₹700 */}
              <TouchableOpacity
                onPress={() => {
                  if (localPriceRange.max === 700) {
                    setLocalPriceRange({ min: 0, max: 10000 });
                  } else {
                    setLocalPriceRange({ min: 0, max: 700 });
                  }
                }}
                className={`px-4 py-2.5 rounded-full border ${
                  localPriceRange.max === 700
                    ? 'border-brand-primary bg-indigo-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${localPriceRange.max === 700 ? 'text-brand-primary' : 'text-slate-600'}`}>
                  Under ₹700
                </Text>
              </TouchableOpacity>

              {/* 50% off */}
              <TouchableOpacity
                onPress={() => setLocalDiscountMin(localDiscountMin === 50 ? null : 50)}
                className={`px-4 py-2.5 rounded-full border ${
                  localDiscountMin === 50
                    ? 'border-brand-primary bg-indigo-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${localDiscountMin === 50 ? 'text-brand-primary' : 'text-slate-600'}`}>
                  50% off
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'gender':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select gender</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((gender) => {
                const isSelected = localGenders.includes(gender);
                return (
                  <TouchableOpacity
                    key={gender}
                    onPress={() => toggleGender(gender)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary' : 'text-slate-600'}`}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'price':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select price range</Text>
            <View className="flex-col gap-2">
              {[
                { label: 'All price ranges', min: 0, max: 10000 },
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 - ₹1000', min: 500, max: 1000 },
                { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                { label: 'Above ₹2000', min: 2000, max: 10000 },
              ].map((preset) => {
                const isSelected = localPriceRange.min === preset.min && localPriceRange.max === preset.max;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => setLocalPriceRange({ min: preset.min, max: preset.max })}
                    className={`p-3 rounded-xl border flex-row justify-between items-center ${
                      isSelected ? 'border-brand-primary bg-indigo-50/5' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary font-bold' : 'text-slate-600'}`}>
                      {preset.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'brand':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select brand</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Vashions', 'Zudio', 'Savana', 'Zara', 'H&M', 'Roadster', 'Mast & Harbour'].map((brand) => {
                const isSelected = localBrands.includes(brand);
                return (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => toggleBrand(brand)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary' : 'text-slate-600'}`}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'color':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select color</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Blue', 'White', 'Black', 'Red', 'Brown'].map((color) => {
                const isSelected = localColors.includes(color);
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => toggleColor(color)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary' : 'text-slate-600'}`}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'discounts':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select minimum discount</Text>
            <View className="flex-col gap-2">
              {[
                { label: 'All discounts', value: null },
                { label: '30% off & above', value: 30 },
                { label: '50% off & above', value: 50 },
                { label: '60% off & above', value: 60 },
              ].map((discount) => {
                const isSelected = localDiscountMin === discount.value;
                return (
                  <TouchableOpacity
                    key={discount.label}
                    onPress={() => setLocalDiscountMin(discount.value)}
                    className={`p-3 rounded-xl border flex-row justify-between items-center ${
                      isSelected ? 'border-brand-primary bg-indigo-50/5' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary font-bold' : 'text-slate-600'}`}>
                      {discount.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'delivery_time':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select delivery speed</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: '2 days delivery', days: 2 },
                { label: 'Standard delivery', days: null },
              ].map((del) => {
                const isSelected = localDeliveryDays === del.days;
                return (
                  <TouchableOpacity
                    key={del.label}
                    onPress={() => setLocalDeliveryDays(del.days)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? 'border-brand-primary bg-indigo-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-brand-primary' : 'text-slate-600'}`}>
                      {del.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'new_arrivals':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select new arrivals</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Last 7 days', 'Last 30 days', 'All items'].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-white"
                >
                  <Text className="text-xs font-semibold text-slate-600">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'fabric':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select fabric</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Cotton', 'Polyester', 'Denim', 'Linen'].map((fabric) => (
                <TouchableOpacity
                  key={fabric}
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-white"
                >
                  <Text className="text-xs font-semibold text-slate-600">{fabric}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'fit':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select fit type</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Slim Fit', 'Regular Fit', 'Oversized'].map((fit) => (
                <TouchableOpacity
                  key={fit}
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-white"
                >
                  <Text className="text-xs font-semibold text-slate-600">{fit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'size':
        return (
          <View>
            <Text className="text-sm font-bold text-slate-800 mb-4">Select size</Text>
            <View className="flex-row flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <TouchableOpacity
                  key={size}
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-white"
                >
                  <Text className="text-xs font-semibold text-slate-600">{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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

        {/* Bottom Sheet Panel */}
        <Animated.View
          style={[animatedSheetStyle]}
          className="bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl pt-6 pb-6 h-[70%] flex-col"
        >
          {/* Filters Title Header in Blue */}
          <Text className="text-base font-bold text-brand-primary mb-4 px-6">
            Filters
          </Text>

          {/* Two Column Section */}
          <View className="flex-1 flex-row border-t border-slate-100">
            {/* Left Sidebar Category Tabs */}
            <View className="w-[135px] bg-slate-50 border-r border-slate-100">
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

            {/* Right Tab Contents Area */}
            <View className="flex-1 bg-white p-5">
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderRightPanelContent()}
              </ScrollView>
            </View>
          </View>

          {/* Double Button Footer */}
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
              className="flex-1 py-3 bg-brand-primary rounded-full items-center justify-center flex-[1.2]"
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
