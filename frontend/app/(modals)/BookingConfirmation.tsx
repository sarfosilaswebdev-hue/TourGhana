import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetBookingById } from "@/hooks/bookings.hook";

const BookingConfirmation = () => {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { data, isFetching } = useGetBookingById(bookingId);
  const booking = data?.data;

  if (isFetching) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1F7A63" />
      </View>
    );
  }

  const details = [
    { icon: "calendar-outline", label: "Tour Date", value: new Date(booking?.tourDate).toDateString() },
    { icon: "people-outline", label: "Group Size", value: `${booking?.groupSize} person(s)` },
    { icon: "person-outline", label: "Name", value: booking?.fullName },
    { icon: "mail-outline", label: "Email", value: booking?.email },
    { icon: "call-outline", label: "Phone", value: booking?.phone },
    { icon: "ellipse-outline", label: "Status", value: booking?.status },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
    >
      {/* Success icon */}
      <View className="items-center mt-10 mb-8">
        <View className="bg-primary-50 rounded-full p-6 mb-4">
          <Ionicons name="checkmark-circle" size={64} color="#1F7A63" />
        </View>
        <Text className="text-2xl font-popBold text-dark">Booking Confirmed!</Text>
        <Text className="text-muted text-center mt-2 font-regular">
          Your tour has been successfully booked.
        </Text>
      </View>

      {/* Card */}
      <View className="bg-surface rounded-2xl p-5 mb-6 border border-primary-100">
        <Text className="text-lg font-popBold text-dark mb-4">
          {booking?.destination?.name}
        </Text>

        {details.map(({ icon, label, value }, i) => (
          <View
            key={label}
            className={`flex-row items-center py-3 ${i < details.length - 1 ? "border-b border-primary-50" : ""}`}
          >
            <View className="bg-primary-50 rounded-full p-2">
              <Ionicons name={icon as any} size={16} color="#1F7A63" />
            </View>
            <Text className="text-muted text-sm ml-3 w-20 font-regular">{label}</Text>
            <Text
              className={`text-sm font-popSb flex-1 ${
                value === "CANCELLED"
                  ? "text-error"
                  : value === "CONFIRMED"
                  ? "text-success"
                  : "text-secondary-600"
              }`}
            >
              {value}
            </Text>
          </View>
        ))}

        {booking?.specialRequest ? (
          <View className="mt-4 bg-primary-50 rounded-xl p-3">
            <Text className="text-muted text-xs font-popSb mb-1">Special Request</Text>
            <Text className="text-dark text-sm font-regular">{booking.specialRequest}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/Trips/Trips")}
        className="bg-primary-500 rounded-xl py-5 items-center mb-3"
      >
        <Text className="text-background font-popBold text-base">View My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/Home")}
        className="rounded-xl py-5 items-center border border-primary-200"
      >
        <Text className="text-primary-500 font-popSb">Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookingConfirmation;