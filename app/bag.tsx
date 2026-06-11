import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Pressable, Dimensions } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  removeFromCart, 
  addToCart, 
  deleteFromCart, 
  toggleItemSelect, 
  toggleAllItemsSelect 
} from '../store/cartSlice';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BagScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  // Select state from Redux
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const products = useSelector((state: RootState) => state.products.items);

  // Address collapse state
  const [addressCollapsed, setAddressCollapsed] = useState(false);

  // Map cart items to actual product details
  const cartItemsWithDetails = cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return {
      ...cartItem,
      product,
    };
  }).filter(item => item.product !== undefined); // Exclude items where product data is not found

  // Calculate pricing summaries for selected items
  const selectedItems = cartItemsWithDetails.filter(item => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const totalOriginalAmount = selectedItems.reduce((sum, item) => sum + (item?.product ? item.product.price * 1.5 : 0) * item.quantity, 0);
  
  // Check if all items are selected
  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  const handleToggleSelectAll = () => {
    dispatch(toggleAllItemsSelect(!allSelected));
  };

  // Render empty state (Oops screen)
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-extrabold text-slate-900 tracking-wide">OOPS ☹</Text>
      <Text className="text-sm font-semibold text-slate-400 mt-1.5">Your bag is empty.</Text>
      
      {/* Empty Bag Icon Asset */}
      <Image
        source={require('../assets/images/empty-bag-icon.png')}
        style={{ width: 180, height: 180, marginVertical: 32 }}
        contentFit="contain"
      />

      <Text className="text-sm font-semibold text-slate-700 mb-6">Add items to your bag now</Text>
      
      <TouchableOpacity 
        onPress={() => router.replace('/')}
        className="bg-brand-primary w-full max-w-[280px] py-3.5 rounded-full items-center justify-center shadow-md shadow-slate-200"
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-sm">Start shopping</Text>
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
        <Text className="text-lg font-bold text-slate-900">Bag</Text>
        <TouchableOpacity onPress={() => router.push('/wishlist')} className="p-2">
          <Ionicons name="heart-outline" size={23} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <View className="flex-1 flex-col justify-between">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Delivery address banner */}
            <View className="bg-white px-4 py-3 border-b border-slate-100 flex-row items-start justify-between">
              <View className="flex-row flex-1 mr-3">
                <View className="bg-emerald-50 p-2 rounded-full mr-3 items-center justify-center">
                  <MaterialCommunityIcons name="moped" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900 leading-5">Delivering in just 60 min</Text>
                  {!addressCollapsed && (
                    <Text className="text-xs text-slate-400 mt-0.5 leading-4">
                      Full address - 29 Aparna Complex, Gurgaon...
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setAddressCollapsed(!addressCollapsed)} className="p-1">
                <Ionicons name={addressCollapsed ? "chevron-down" : "chevron-up"} size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Free Delivery Promo Banner */}
            <View className="bg-indigo-50/30 px-4 py-3 flex-row items-center border-b border-slate-100">
              <Ionicons name="checkmark-circle" size={18} color="#4f46e5" className="mr-2.5" />
              <Text className="text-xs font-bold text-brand-primary leading-4">
                Yayyy! Your order is eligible for FREE delivery.
              </Text>
            </View>

            {/* Deselect / Select all checkbox control */}
            <TouchableOpacity 
              onPress={handleToggleSelectAll}
              className="px-4 py-3.5 bg-white border-b border-slate-100/50 flex-row items-center"
              activeOpacity={0.8}
            >
              <Text className="text-xs font-bold text-brand-primary underline tracking-wide">
                {allSelected ? 'Deselect all items' : 'Select all items'}
              </Text>
            </TouchableOpacity>

            {/* Cart Product List */}
            <View className="bg-white flex-col">
              {cartItemsWithDetails.map((item, index) => {
                const isSelected = item.selected;
                const product = item.product!;

                return (
                  <View 
                    key={`${product.id}-${index}`} 
                    className="flex-row items-center px-4 py-4 border-b border-slate-100"
                  >
                    {/* Item checkbox toggle */}
                    <TouchableOpacity 
                      onPress={() => dispatch(toggleItemSelect(product.id))}
                      className="mr-3 p-1 active:opacity-60"
                    >
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={22} 
                        color={isSelected ? "#4f46e5" : "#cbd5e1"} 
                      />
                    </TouchableOpacity>

                    {/* Product image (local static require mapping) */}
                    <Image
                      source={product.image}
                      style={{ width: 85, height: 105 }}
                      className="rounded-xl bg-slate-50 border border-slate-100"
                      contentFit="cover"
                    />

                    {/* Product metadata content right panel */}
                    <View className="flex-1 ml-4 flex-col">
                      <Text className="text-sm font-bold text-slate-800 leading-5" numberOfLines={1}>
                        {product.title}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium leading-4" numberOfLines={1}>
                        {product.description}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium leading-4 mb-2" numberOfLines={1}>
                        {product.category}
                      </Text>

                      <View className="flex-row items-center justify-between">
                        {/* Price Details */}
                        <View className="flex-col">
                          <View className="flex-row items-center space-x-1.5">
                            <Text className="text-sm font-extrabold text-slate-900">₹{product.price}</Text>
                            <Text className="text-xs text-slate-400 line-through">₹{product.price * 1.5}</Text>
                          </View>
                          
                          {/* TRY N BUY tag */}
                          <View className="flex-row items-center bg-slate-50 px-1 py-0.5 rounded border border-slate-100 mt-1 self-start">
                            <Text className="text-[6px] font-bold text-slate-400 uppercase">TRY </Text>
                            <Text className="text-[7px] font-black text-brand-primary">N</Text>
                            <Text className="text-[6px] font-bold text-slate-400 uppercase"> BUY</Text>
                          </View>
                        </View>

                        {/* Quantity Adjuster Capsule */}
                        <View className="flex-row items-center border border-slate-200 rounded-full px-1.5 py-1 min-w-[76px] justify-between">
                          {/* Left: minus or trash */}
                          <TouchableOpacity 
                            onPress={() => dispatch(removeFromCart(product.id))}
                            className="p-1 items-center justify-center"
                          >
                            <Ionicons 
                              name={item.quantity === 1 ? "trash-outline" : "remove"} 
                              size={item.quantity === 1 ? 14 : 16} 
                              color="#64748b" 
                            />
                          </TouchableOpacity>

                          {/* Center quantity text */}
                          <Text className="text-xs font-bold text-slate-800 px-1">{item.quantity}</Text>

                          {/* Right: plus */}
                          <TouchableOpacity 
                            onPress={() => dispatch(addToCart(product.id))}
                            className="p-1 items-center justify-center"
                          >
                            <Ionicons name="add" size={16} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Price breakdown summary section */}
            {selectedItems.length > 0 && (
              <View className="bg-white mt-3 p-4 border-t border-slate-100 flex-col mb-10">
                <Text className="text-xs font-bold text-slate-800 mb-3 tracking-wide uppercase">Price Summary</Text>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-medium text-slate-500">Subtotal price</Text>
                  <Text className="text-xs font-semibold text-slate-800">₹{totalOriginalAmount}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-medium text-slate-500">Order discounts</Text>
                  <Text className="text-xs font-semibold text-emerald-600">-₹{totalOriginalAmount - totalAmount}</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-medium text-slate-500">Delivery fees</Text>
                  <Text className="text-xs font-semibold text-emerald-600">FREE</Text>
                </View>

                <View className="w-full h-[1px] bg-slate-100 my-2" />

                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm font-bold text-slate-800">Grand total</Text>
                  <Text className="text-sm font-bold text-brand-primary">₹{totalAmount}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky checkout footer button */}
          <View 
            className="bg-white border-t border-slate-100 px-6 py-4 shadow-lg flex-col justify-between"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            {selectedItems.length > 0 && (
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-xs text-slate-500 font-medium">Selected items total ({selectedItems.length})</Text>
                <Text className="text-base font-extrabold text-slate-900">₹{totalAmount}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              disabled={selectedItems.length === 0}
              className={`w-full py-4 rounded-full items-center justify-center shadow-md ${
                selectedItems.length === 0 ? 'bg-slate-300 shadow-none' : 'bg-brand-primary shadow-slate-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm tracking-wide">
                {selectedItems.length === 0 ? 'Select items to checkout' : 'Proceed to pay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
