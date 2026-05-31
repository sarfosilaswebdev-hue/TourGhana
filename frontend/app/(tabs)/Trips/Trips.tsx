import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import React, { useMemo, useRef } from "react";
import { Booking } from "@/Utils/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { optimizeImage } from "@/Utils/optimizeImage";
import {
  useCancelBooking,
  useDeleteBooking,
  useGetUserBookings,
} from "@/hooks/bookings.hook";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, AppColors } from "@/context/ThemeContext";

// ── Booking card ──────────────────────────────────────────────
const BookingCard = ({ item }: { item: Booking }) => {
  const router = useRouter();
  const { isDark, colors: C } = useTheme();
  const { mutateAsync: cancel, isPending: cancelling } = useCancelBooking();
  const { mutateAsync: deleteBooking, isPending: deleting } = useDeleteBooking();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const STATUS_CONFIG = {
    PENDING: {
      label: "Pending",
      bg: C.secondary[50],
      color: C.secondary[600],
      icon: "time-outline",
    },
    CONFIRMED: {
      label: "Confirmed",
      bg: C.primary[50],
      color: C.primary[500],
      icon: "checkmark-circle-outline",
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "rgba(239,68,68,0.08)",
      color: C.error,
      icon: "close-circle-outline",
    },
  } as const;

  const styles = useMemo(() => createStyles(C, isDark), [isDark]);
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;

  const tourDate = new Date(item.tourDate);
  const formattedDate = tourDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleCancel() {
    Alert.alert(
      "Cancel booking",
      `Cancel your trip to ${item.destination.name}? This cannot be undone.`,
      [
        { text: "Keep it", style: "cancel" },
        { text: "Yes, cancel", style: "destructive", onPress: () => cancel(item.id) },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      "Delete booking",
      "Remove this booking from your trips list?",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 280,
              useNativeDriver: true,
            }).start(() => deleteBooking(item.id));
          },
        },
      ],
    );
  }

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(modals)/BookingConfirmation",
            params: { bookingId: item.id },
          })
        }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: optimizeImage(item.destination.images[0], { width: 600, quality: 75 }) }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.imageScrim} />

          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={11} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteBtn}
            activeOpacity={0.8}
            disabled={deleting}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={C.error} />
            ) : (
              <Ionicons name="trash-outline" size={15} color={C.error} />
            )}
          </TouchableOpacity>

          <View style={styles.imageFooter}>
            <Text style={styles.destinationName} numberOfLines={1}>
              {item.destination.name}
            </Text>
            <View style={styles.regionRow}>
              <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.75)" />
              <Text style={styles.regionText}>{item.destination.region}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconBox}>
                <Ionicons name="calendar-outline" size={14} color={C.primary[500]} />
              </View>
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <View style={styles.metaIconBox}>
                <Ionicons name="people-outline" size={14} color={C.primary[500]} />
              </View>
              <Text style={styles.metaText}>
                {item.groupSize} {item.groupSize === 1 ? "person" : "people"}
              </Text>
            </View>
          </View>

          {item.status !== "CANCELLED" && (
            <TouchableOpacity
              onPress={handleCancel}
              disabled={cancelling}
              style={styles.cancelBtn}
              activeOpacity={0.8}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={C.error} />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel booking</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {cancelling && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color={C.primary[500]} />
              <Text style={styles.loadingPillText}>Cancelling…</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Empty state ───────────────────────────────────────────────
const EmptyState = () => {
  const router = useRouter();
  const { isDark, colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="map-outline" size={40} color={C.primary[500]} />
      </View>
      <Text style={styles.emptyTitle}>No trips yet</Text>
      <Text style={styles.emptyBody}>
        Your booked tours will appear here.{"\n"}Go explore Ghana!
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        style={styles.emptyBtn}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyBtnText}>Explore destinations</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Screen ────────────────────────────────────────────────────
const Trips = () => {
  const { data, isLoading } = useGetUserBookings();
  const { top } = useSafeAreaInsets();
  const { isDark, colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);

  const bookings: Booking[] = data?.data ?? [];
  const upcoming = bookings.filter((b) => b.status !== "CANCELLED").length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

  if (isLoading) {
    return (
      <View style={[styles.root, { paddingTop: top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.primary[500]} />
          <Text style={styles.loadingLabel}>Loading your trips…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Trips</Text>
            {bookings.length > 0 && (
              <View style={styles.statsRow}>
                {upcoming > 0 && (
                  <View style={[styles.statPill, { backgroundColor: C.primary[50] }]}>
                    <Ionicons name="calendar" size={11} color={C.primary[500]} />
                    <Text style={[styles.statText, { color: C.primary[600] }]}>
                      {upcoming} upcoming
                    </Text>
                  </View>
                )}
                {cancelled > 0 && (
                  <View style={[styles.statPill, { backgroundColor: "rgba(239,68,68,0.08)" }]}>
                    <Ionicons name="close-circle-outline" size={11} color={C.error} />
                    <Text style={[styles.statText, { color: C.error }]}>
                      {cancelled} cancelled
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

export default Trips;

// ── Styles factory ────────────────────────────────────────────
const createStyles = (C: AppColors, isDark: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingLabel: { fontFamily: "PoppinsRegular", fontSize: 14, color: C.muted },
    listContent: { paddingHorizontal: 16, paddingBottom: 120, flexGrow: 1 },

    header: { paddingTop: 8, paddingBottom: 20 },
    headerTitle: { fontFamily: "PoppinsBold", fontSize: 28, color: C.dark, marginBottom: 8 },
    statsRow: { flexDirection: "row", gap: 8 },
    statPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statText: { fontFamily: "PoppinsSemiBold", fontSize: 11 },

    cardWrapper: { marginBottom: 16 },
    card: {
      backgroundColor: C.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.primary[100],
      overflow: "hidden",
    },

    imageContainer: { height: 180, position: "relative" },
    image: { width: "100%", height: "100%" },
    imageScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
    statusBadge: {
      position: "absolute", top: 10, left: 10,
      flexDirection: "row", alignItems: "center", gap: 4,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    statusText: { fontFamily: "PoppinsSemiBold", fontSize: 10, letterSpacing: 0.3 },
    deleteBtn: {
      position: "absolute", top: 10, right: 10,
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)",
      alignItems: "center", justifyContent: "center",
    },
    imageFooter: { position: "absolute", bottom: 10, left: 12, right: 12 },
    destinationName: { fontFamily: "PoppinsBold", fontSize: 18, color: "#fff", lineHeight: 22 },
    regionRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
    regionText: { fontFamily: "PoppinsRegular", fontSize: 11, color: "rgba(255,255,255,0.75)" },

    body: { padding: 14 },
    metaRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: C.primary[50],
      borderRadius: 12, borderWidth: 1, borderColor: C.primary[100],
      paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
    },
    metaItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
    metaIconBox: {
      width: 26, height: 26, borderRadius: 7,
      backgroundColor: C.primary[100], alignItems: "center", justifyContent: "center",
    },
    metaText: { fontFamily: "PoppinsRegular", fontSize: 12, color: C.dark, flexShrink: 1 },
    metaSeparator: { width: 1, height: 24, backgroundColor: C.primary[100], marginHorizontal: 10 },
    cancelBtn: {
      borderWidth: 1, borderColor: C.error, borderRadius: 12,
      paddingVertical: 11, alignItems: "center", justifyContent: "center", minHeight: 42,
    },
    cancelBtnText: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: C.error },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "rgba(21,43,35,0.8)" : "rgba(249,250,251,0.75)",
      alignItems: "center", justifyContent: "center", borderRadius: 20,
    },
    loadingPill: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: C.surface,
      borderWidth: 1, borderColor: C.primary[100], borderRadius: 20,
      paddingHorizontal: 16, paddingVertical: 10,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    loadingPillText: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: C.primary[500] },

    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: 80 },
    emptyIconWrap: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: C.primary[50], borderWidth: 1, borderColor: C.primary[100],
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    emptyTitle: { fontFamily: "PoppinsBold", fontSize: 20, color: C.dark, marginBottom: 8 },
    emptyBody: { fontFamily: "PoppinsRegular", fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 22, marginBottom: 24 },
    emptyBtn: { backgroundColor: C.primary[500], borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
    emptyBtnText: { fontFamily: "PoppinsBold", fontSize: 14, color: "#fff" },
  });
