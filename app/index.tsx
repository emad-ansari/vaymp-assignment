import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectFilteredProducts, resetFilters } from '../store/productsSlice';
import { RootState, AppDispatch } from '../store/store';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import FilterSortBar from '../components/FilterSortBar';
import SortBottomSheet from '../components/SortBottomSheet';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux store selectors
  const filteredProducts = useSelector(selectFilteredProducts);
  const { status, error, searchQuery, appliedFilters } = useSelector((state: RootState) => state.products);

  // Local UI states
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(true);
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Scroll offset tracking for hide-on-scroll logic
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentOffset - scrollOffsetRef.current;
    
    // Toggle floating bar visibility based on scroll direction
    if (currentOffset <= 20) {
      setIsFloatingBarVisible(true);
    } else if (scrollDelta > 15 && isFloatingBarVisible) {
      // User is scrolling down: hide bar
      setIsFloatingBarVisible(false);
    } else if (scrollDelta < -15 && !isFloatingBarVisible) {
      // User is scrolling up: show bar
      setIsFloatingBarVisible(true);
    }

    scrollOffsetRef.current = currentOffset;
  };

  const getResultsHeaderLabel = () => {
    const totalCount = filteredProducts.length;
    let categoryText = "Men's & Women's";
    
    if (appliedFilters.categories.length === 1) {
      const selectedCat = appliedFilters.categories[0];
      categoryText = selectedCat === "men's clothing" ? "Men's" : "Women's";
    }
    
    if (searchQuery.trim().length > 0) {
      return `Showing ${totalCount} ${totalCount === 1 ? 'result' : 'results'} for "${searchQuery}"`;
    }
    
    return `Showing ${totalCount} results for ${categoryText} T-shirts`;
  };

  // Compute number of active filters to show dot badge
  const activeFiltersCount = 
    appliedFilters.categories.length + 
    appliedFilters.genders.length +
    appliedFilters.brands.length +
    appliedFilters.colors.length +
    (appliedFilters.minPrice > 0 || appliedFilters.maxPrice < 10000 ? 1 : 0) + 
    (appliedFilters.minRating > 0 ? 1 : 0) +
    (appliedFilters.deliveryDays !== null ? 1 : 0) +
    (appliedFilters.discountMin !== null ? 1 : 0);

  return (
    <View className="flex-1 bg-white relative">
      <StatusBar style="dark" />
      
      {/* Reusable Header */}
      <Header title="T-shirts" onBackPress={() => {}} />

      {/* Main Content Area */}
      {status === 'loading' && filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-slate-50">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-sm font-semibold text-slate-500 mt-4">Curating products for you...</Text>
        </View>
      ) : status === 'failed' && filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 bg-slate-50">
          <Ionicons name="alert-circle-outline" size={54} color="#ef4444" />
          <Text className="text-lg font-bold text-slate-800 mt-4">Failed to load products</Text>
          <Text className="text-sm text-slate-500 text-center mt-2 mb-6 px-4">
            {error || "Check your internet connection and try again."}
          </Text>
          <TouchableOpacity 
            onPress={() => dispatch(fetchProducts())}
            className="bg-brand-primary px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-sm">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onRefresh={() => dispatch(fetchProducts())}
          refreshing={status === 'loading'}
          contentContainerStyle={{
            paddingHorizontal: 6,
            paddingTop: 8,
            paddingBottom: 100, // extra padding so list items are not covered by floating pill
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between'
          }}
          ListHeaderComponent={
            <View className="px-3.5 py-3.5 bg-white">
              <Text className="text-xs font-semibold text-slate-500 tracking-wide">
                {getResultsHeaderLabel()}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-6">
              <View className="bg-slate-50 p-6 rounded-full mb-4">
                <Ionicons name="search-outline" size={42} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-800">No results found</Text>
              <Text className="text-sm text-slate-500 text-center mt-2 mb-6 max-w-[280px]">
                We couldn't find matches. Try modifying your search keywords or clearing active filters.
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(resetFilters())}
                className="bg-brand-primary px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold text-sm">Clear Active Filters</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <ProductCard item={item} index={index} />
          )}
        />
      )}

      {/* Floating Filter and Sort Bar */}
      {filteredProducts.length > 0 && (
        <FilterSortBar
          isVisible={isFloatingBarVisible}
          activeFilterCount={activeFiltersCount}
          onSortPress={() => setIsSortVisible(true)}
          onFilterPress={() => setIsFilterVisible(true)}
        />
      )}

      {/* Sort Option Bottom Sheet */}
      <SortBottomSheet
        visible={isSortVisible}
        onClose={() => setIsSortVisible(false)}
      />

      {/* Filters Selection Bottom Sheet */}
      <FilterBottomSheet
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
      />
    </View>
  );
}
