import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetUserReviews } from "@/hooks/reviews.hook";
import { Review } from "@/Utils/types";

const StarRating = ({ rating }: { rating: number }) => (
  <View className="flex-row gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={14}
        color="#F59E0B"
      />
    ))}
  </View>
);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyReviews = () => {
  const router = useRouter();
  const { data, isLoading } = useGetUserReviews();
  const reviews: Review[] = data?.data ?? [];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary-500 pt-16 pb-6 px-6 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-primary-400 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-popBold text-background">My Reviews</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F7A63" />
        </View>
      ) : reviews.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="star-outline" size={56} color="#D1D5DB" />
          <Text className="text-lg font-popBold text-dark mt-4">No reviews yet</Text>
          <Text className="text-sm text-muted font-regular text-center mt-2">
            Visit a destination and share your experience!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {reviews.map((review) => (
            <View
              key={review.id}
              className="bg-surface rounded-2xl border border-primary-100 overflow-hidden"
            >
              <View className="flex-row items-center p-4 gap-3">
                {review.destination?.images?.[0] ? (
                  <Image
                    source={{ uri: review.destination.images[0] }}
                    style={{ width: 60, height: 60, borderRadius: 12 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-15 h-15 rounded-xl bg-primary-50 items-center justify-center">
                    <Ionicons name="image-outline" size={24} color="#1F7A63" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="font-popBold text-dark text-sm" numberOfLines={1}>
                    {review.destination?.name ?? "Unknown destination"}
                  </Text>
                  <StarRating rating={review.rating} />
                  <Text className="text-xs text-muted font-regular mt-1">
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
              </View>
              {review.comment ? (
                <View className="px-4 pb-4">
                  <Text className="text-sm text-dark font-regular leading-5">
                    {review.comment}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MyReviews;
