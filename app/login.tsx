import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Dummy credentials ─────────────────────────────────────────────────────────
const DUMMY_EMAIL = 'user@vaymp.com';
const DUMMY_PASSWORD = 'vaymp@123';
const DUMMY_NAME = 'Emad Ansari';
// ───────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef<TextInput>(null);

  // Shake animation for error
  const shakeX = useSharedValue(0);

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(10, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(-8, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(8, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 60, easing: Easing.out(Easing.quad) }),
    );
  };

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleLogin = () => {
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      triggerShake();
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      triggerShake();
      return;
    }

    // Credential check
    if (
      email.trim().toLowerCase() !== DUMMY_EMAIL ||
      password !== DUMMY_PASSWORD
    ) {
      setError('Incorrect email or password. Check the hint below.');
      triggerShake();
      return;
    }

    // Animate loading state then navigate
    setIsLoading(true);
    setTimeout(() => {
      dispatch(loginSuccess({ email: DUMMY_EMAIL, name: DUMMY_NAME }));
      setIsLoading(false);
      router.replace('/');
    }, 1200);
  };

  const fillDummyCredentials = () => {
    setEmail(DUMMY_EMAIL);
    setPassword(DUMMY_PASSWORD);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom + 24, 40),
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Brand Area ── */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(600).easing(Easing.out(Easing.quad))}
          className="items-center pt-10 pb-8 px-8"
        >
          <View className="flex-row items-center mb-4">
            <Image
              source={require('../assets/images/app-logo.png')}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight ml-2">
              vaymp
            </Text>
          </View>
          <Text className="text-base text-slate-400 font-medium text-center">
            Your premium fashion destination
          </Text>
        </Animated.View>

        {/* ── Decorative divider ── */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(600).easing(Easing.out(Easing.quad))}
          className="mx-8 mb-8"
        >
          <View className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <View className="flex-row items-center mt-7 mb-1">
            <Text className="text-2xl font-bold text-slate-900">Welcome back 👋</Text>
          </View>
          <Text className="text-sm text-slate-400 font-medium">
            Sign in to continue shopping
          </Text>
        </Animated.View>

        {/* ── Login Form ── */}
        <Animated.View
          style={[animatedFormStyle]}
          className="px-8 flex-col"
        >
          {/* Email Field */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500).easing(Easing.out(Easing.quad))}
          >
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Email Address
            </Text>
            <View
              className={`flex-row items-center border rounded-2xl px-4 h-14 bg-slate-50 ${
                error && !email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <Ionicons name="mail-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-slate-800 text-sm font-medium"
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={() => setEmail('')} className="p-1">
                  <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Password Field */}
          <Animated.View
            entering={FadeInDown.delay(220).duration(500).easing(Easing.out(Easing.quad))}
            className="mt-5"
          >
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Password
            </Text>
            <View
              className={`flex-row items-center border rounded-2xl px-4 h-14 bg-slate-50 ${
                error && !password ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
              <TextInput
                ref={passwordRef}
                className="flex-1 ml-3 text-slate-800 text-sm font-medium"
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Error Message */}
          {!!error && (
            <Animated.View
              entering={FadeInDown.duration(250)}
              className="flex-row items-center mt-3 px-1"
            >
              <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
              <Text className="text-xs text-red-500 font-semibold ml-1.5">{error}</Text>
            </Animated.View>
          )}

          {/* Forgot Password */}
          <Animated.View
            entering={FadeInDown.delay(280).duration(500).easing(Easing.out(Easing.quad))}
            className="items-end mt-3"
          >
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-xs font-bold text-brand-primary">Forgot password?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View
            entering={FadeInDown.delay(340).duration(500).easing(Easing.out(Easing.quad))}
            className="mt-8"
          >
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              className="bg-brand-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-sm ml-2.5">Signing in...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-[15px] tracking-wide">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* ── Divider ── */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500).easing(Easing.out(Easing.quad))}
            className="flex-row items-center mt-8 mb-6"
          >
            <View className="flex-1 h-px bg-slate-100" />
            <Text className="text-xs text-slate-400 font-medium mx-4">OR</Text>
            <View className="flex-1 h-px bg-slate-100" />
          </Animated.View>

          {/* ── Demo Credential Hint Card ── */}
          <Animated.View
            entering={FadeInDown.delay(460).duration(500).easing(Easing.out(Easing.quad))}
          >
            <TouchableOpacity
              onPress={fillDummyCredentials}
              activeOpacity={0.8}
              className="border border-dashed border-brand-primary/50 rounded-2xl p-4 bg-indigo-50/40"
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-brand-primary/10 p-1.5 rounded-lg mr-2">
                  <Ionicons name="key-outline" size={14} color="#4f46e5" />
                </View>
                <Text className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                  Demo Credentials
                </Text>
                <View className="ml-auto bg-brand-primary/10 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-brand-primary">TAP TO FILL</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-1.5">
                <Ionicons name="mail" size={12} color="#94a3b8" />
                <Text className="text-xs text-slate-500 ml-2 font-medium">
                  <Text className="text-slate-700 font-bold">{DUMMY_EMAIL}</Text>
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="lock-closed" size={12} color="#94a3b8" />
                <Text className="text-xs text-slate-500 ml-2 font-medium">
                  Password:{' '}
                  <Text className="text-slate-700 font-bold">{DUMMY_PASSWORD}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Sign Up Prompt ── */}
          <Animated.View
            entering={FadeInDown.delay(520).duration(500).easing(Easing.out(Easing.quad))}
            className="flex-row items-center justify-center mt-8"
          >
            <Text className="text-sm text-slate-400 font-medium">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-sm font-bold text-brand-primary">Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
