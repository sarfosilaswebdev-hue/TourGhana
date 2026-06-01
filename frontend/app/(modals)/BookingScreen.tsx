import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import * as Haptics from "expo-haptics";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useCreateBooking } from "@/hooks/bookings.hook";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/contants/colors";

const BookingScreen = () => {
  const router = useRouter();
  const { destinationId, destinationName } = useLocalSearchParams<{
    destinationId: string;
    destinationName: string;
  }>();

  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { top } = useSafeAreaInsets();

  const [tourDate, setTourDate]               = useState(new Date());
  const [showDatePicker, setShowDatePicker]   = useState(false);
  const [groupSize, setGroupSize]             = useState(1);
  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [phone, setPhone]                     = useState("");
  const [specialRequest, setSpecialRequest]   = useState("");
  const [error, setError]                     = useState("");
  const [focused, setFocused]                 = useState<string | null>(null);

  async function handleSubmit() {
    setError("");
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const booking = await createBooking({
        destinationId,
        tourDate: tourDate.toISOString(),
        groupSize,
        fullName,
        email,
        phone,
        specialRequest,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/(modals)/BookingConfirmation",
        params: { bookingId: booking.data.id },
      });
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Failed to create booking. Please try again.");
    }
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: top }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} className="pt-3 pb-7">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={18} color={Colors.primary[500]} />
          </TouchableOpacity>

          <View className="w-7 h-0.5 bg-primary-500 rounded-full mb-3" />
          <Text className="font-popSb text-primary-500 tracking-widest text-xs mb-1.5">
            BOOKING FOR
          </Text>
          <Text className="font-popBold text-dark text-3xl leading-9" numberOfLines={2}>
            {destinationName}
          </Text>

          {/* Kente strip */}
          <View style={styles.kenteRow}>
            {["#F2C94C","#1F7A63","#CC0001","#F2C94C","#1F7A63","#000000","#F2C94C","#CC0001","#1F7A63","#F2C94C"].map((c, i) => (
              <View key={i} style={[styles.kenteBlock, { backgroundColor: c }]} />
            ))}
          </View>
        </Animated.View>

        {/* ── SECTION 1: Journey Details ─────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(500)}
          className="bg-surface rounded-2xl p-5 mb-4 border border-primary-100"
        >
          <Text className="font-popSb text-primary-500 text-xs tracking-widest mb-4">
            01 — JOURNEY DETAILS
          </Text>

          {/* Tour Date */}
          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2">
            Tour Date
          </Text>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDatePicker(true); }}
            className="flex-row items-center bg-primary-50 border border-primary-100 rounded-xl px-4 py-3.5"
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center mr-3">
              <Ionicons name="calendar" size={15} color={Colors.primary[500]} />
            </View>
            <Text className="flex-1 font-regular text-dark text-sm">
              {formatDate(tourDate)}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={tourDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setTourDate(date);
              }}
            />
          )}

          {/* Group Size */}
          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2 mt-5">
            Group Size
          </Text>
          <View
            className="flex-row items-center bg-primary-50 border border-primary-100 rounded-xl overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setGroupSize((n) => Math.max(1, n - 1)); }}
              className="w-14 h-16 items-center justify-center bg-primary-100"
              activeOpacity={0.7}
            >
              <Ionicons
                name="remove"
                size={20}
                color={groupSize === 1 ? Colors.muted : Colors.primary[500]}
              />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text className="font-popBold text-black text-3xl leading-9">
                {groupSize}
              </Text>
              <Text className="font-regular text-muted" style={{ fontSize: 9, letterSpacing: 2 }}>
                {groupSize === 1 ? "PERSON" : "PEOPLE"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setGroupSize((n) => n + 1); }}
              className="w-14 h-16 items-center justify-center bg-primary-100"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SECTION 2: Your Details ─────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          className="bg-surface rounded-2xl p-5 mb-4 border border-primary-100"
        >
          <Text className="font-popSb text-primary-500 text-xs tracking-widest mb-4">
            02 — YOUR DETAILS
          </Text>

          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2">
            Full Name *
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Mensah"
            placeholderTextColor={Colors.muted}
            style={[
              styles.input,
              focused === "name" && styles.inputFocused,
            ]}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />

          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2 mt-4">
            Email Address *
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              focused === "email" && styles.inputFocused,
            ]}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />

          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2 mt-4">
            Phone Number *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+233 xx xxx xxxx"
            placeholderTextColor={Colors.muted}
            keyboardType="phone-pad"
            style={[
              styles.input,
              focused === "phone" && styles.inputFocused,
            ]}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
          />
        </Animated.View>

        {/* ── SECTION 3: Special Requests ─────────────── */}
        <Animated.View
          entering={FadeInDown.delay(240).duration(500)}
          className="bg-surface rounded-2xl p-5 mb-4 border border-primary-100"
        >
          <Text className="font-popSb text-primary-500 text-xs tracking-widest mb-4">
            03 — SPECIAL REQUESTS
          </Text>

          <Text className="font-popSb text-muted text-xs uppercase tracking-wide mb-2">
            Notes (Optional)
          </Text>
          <TextInput
            value={specialRequest}
            onChangeText={setSpecialRequest}
            placeholder={"Dietary needs, accessibility requirements,\nor anything else we should know…"}
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textarea,
              focused === "notes" && styles.inputFocused,
            ]}
            onFocus={() => setFocused("notes")}
            onBlur={() => setFocused(null)}
          />
        </Animated.View>

        {/* ── ERROR ────────────────────────────────────── */}
        {!!error && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
            style={{ gap: 8 }}
          >
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text className="text-error text-sm font-regular flex-1">{error}</Text>
          </Animated.View>
        )}

        {/* ── CTA ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-primary-500 rounded-2xl py-5 items-center justify-center"
            style={[isPending && { opacity: 0.65 }]}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <Text className="font-popBold text-background text-base tracking-wide">
                  Confirm Booking
                </Text>
                <View className="w-7 h-7 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="arrow-forward" size={14} color={Colors.background} />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center py-4"
            activeOpacity={0.6}
          >
            <Text className="font-popSb text-muted text-sm">Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  kenteRow: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 18,
  },
  kenteBlock: {
    flex: 1,
    height: 4,
  },
  input: {
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "PoppinsRegular",
    fontSize: 15,
    color: Colors.dark,
  },
  inputFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.surface,
  },
  textarea: {
    minHeight: 110,
    paddingTop: 14,
  },
});

export default BookingScreen;
