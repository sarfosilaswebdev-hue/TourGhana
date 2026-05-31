import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useGetDestinationById } from "@/hooks/destination.hook";
import { Destination, Message, MessageRole } from "@/Utils/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { optimizeImage } from "@/Utils/optimizeImage";
import MapView, { Marker } from "react-native-maps";
import { Colors } from "@/contants/colors";
import { DefaultStyles } from "@/contants/contants";
import { useNavigation } from "@react-navigation/native";
import ChatCard from "@/components/ui/ChatCard";
import { useGetConversations, useSendChat, useDeleteMessage, useDeleteAllChats } from "@/hooks/chat.hook";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme, useThemeColors } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const IMAGE_HEIGHT = 430;

const DestinationDetailsScreen = () => {
  const { DestinationId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const C = useThemeColors();
  const {isDark} = useTheme();

  // ── ALL hooks first, before any early returns ──
  const [favourited, setFavourited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const scrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    scrollY.value = contentOffset.y;

    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    setShowScrollButton(!isAtBottom);
  };

  const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

  useEffect(() => {
    opacity.value = withTiming(showScrollButton ? 1 : 0, {
      duration: 200,
    });
  }, [showScrollButton]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [-IMAGE_HEIGHT / 2, 0, IMAGE_HEIGHT * 0.74],
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [2, 1, 2],
        ),
      },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, IMAGE_HEIGHT / 2], [0, 1]),
  }));

  const touchableOpacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: withTiming(showScrollButton ? 0 : 20),
      },
    ],
  }));

  const destId = Array.isArray(DestinationId)
    ? DestinationId[0]
    : DestinationId;

  const { data, isFetching } = useGetDestinationById(destId ?? "");
  const destination: Destination | undefined = data?.destination;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const { sendChat } = useSendChat();
  const { mutateAsync: deleteMessageApi } = useDeleteMessage();
  const { mutateAsync: deleteAllChatsApi } = useDeleteAllChats();
  const { data: conversation, refetch: refetchConversations } =
    useGetConversations(destId ?? "");

  useEffect(() => {
    if (!conversation) return;
    const {
      messages: fetchedMessages,
      conversationId: existingConversationId,
    } = conversation;
    if (existingConversationId) setConversationId(existingConversationId);
    if (fetchedMessages?.length > 0) {
      setMessages(
        fetchedMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role === "USER" ? MessageRole.USER : MessageRole.ASSISTANT,
          content: msg.content,
          createdAt: msg.createdAt ?? new Date().toISOString(),
        })),
      );
    }
  }, [conversation]);

  // ── navigation.setOptions must live in useLayoutEffect, never in render ──
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="p-2 bg-background/60 rounded-full"
          onPress={() => setFavourited((prev) => !prev)}
          style={[
            DefaultStyles.shadow,
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "rgba(0,0,0,0.2)",
            },
          ]}
        >
          <Ionicons
            name="bookmark"
            size={24}
            color={favourited ? Colors.primary[500] : "rgba(0,0,0,0.8)"}
          />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
          className="p-2 bg-background/60 rounded-full"
          onPress={() => router.back()}
          style={[
            DefaultStyles.shadow,
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "rgba(0,0,0,0.2)",
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.8)" />
        </TouchableOpacity>
      ),
      headerTransparent: true,
      headerShown: !isFetching,
      headerBackground: () => (
        <Animated.View
          className="bg-background"
          style={[
            backgroundAnimatedStyle,
            { height: 120, borderWidth: StyleSheet.hairlineWidth },
          ]}
        />
      ),
    });
  }, [favourited, isFetching]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: userText,
      createdAt: new Date().toISOString(),
    };

    const assistantId = `ai-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: MessageRole.ASSISTANT,
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput("");
    setStreamingMessageId(assistantId);

    try {
      await sendChat({
        destinationId: destId ?? "",
        chat: userText,
        conversationId: conversationId || undefined,
        onConversationId: (id) => setConversationId(id),
        onChunk: async (chunk) => {
          await sleep(50);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          );
        },
        onFinish: async () => {
          setStreamingMessageId(null);
          await refetchConversations();
        },
      });
    } catch (err) {
      console.error("❌ Chat error:", err);
      setStreamingMessageId(null);
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Optimistically remove from local state
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteMessageApi(messageId);
    } catch {
      // Revert on failure by refetching
      await refetchConversations();
    }
  };

  const handleDeleteAllChats = async () => {
    setMessages([]);
    setConversationId(null);
    try {
      await deleteAllChatsApi(destId ?? "");
    } catch {
      await refetchConversations();
    }
  };

  // ── Early returns only after all hooks ──
  if (!DestinationId) return null;

  if (isFetching) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-3 text-gray-400 text-sm">
          Loading destination...
        </Text>
      </View>
    );
  }

  if (!destination) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="map-outline" size={48} color="#ccc" />
        <Text className="mt-3 text-gray-400 text-base">
          Destination not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-2 bg-gray-100 rounded-full"
        >
          <Text className="text-gray-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullStars = Math.floor(destination.rating ?? 4.5);
  const hasHalfStar = (destination.rating ?? 4.5) % 1 >= 0.5;

  function handleScrollToButtom() {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={10}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 relative"
    >
      <Stack.Screen />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* ── HERO ── */}
        <Animated.View style={{ height: IMAGE_HEIGHT }} className="relative">
          <Animated.Image
            source={{
              uri: optimizeImage(destination.images[0], {
                width: 800,
                quality: 80,
              }),
            }}
            style={[
              { width, height: IMAGE_HEIGHT, position: "absolute" },
              imageAnimatedStyle,
            ]}
            resizeMode="cover"
          />

          {/* Hero text pinned to bottom */}
          <View className="absolute bottom-5 left-5 right-5">
            <View className="self-start bg-black/30 rounded-full px-3 py-1 mb-2">
              <Text className="text-white text-xs font-popSb tracking-widest uppercase">
                {destination.category ?? "Travel"}
              </Text>
            </View>
            <Text className="text-white text-3xl font-popBold leading-tight">
              {destination.name}
            </Text>
            <View className="flex-row items-center mt-1.5">
              <Ionicons
                name="location-sharp"
                size={13}
                color="rgba(255,255,255,0.75)"
              />
              <Text className="text-white/75 text-sm ml-1 font-regular">
                {destination.region ?? "Unknown location"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── BODY ── */}
        <View className="px-5 pt-5 pb-36 bg-background">
          {/* Rating row */}
          <View className="flex-row items-center mb-5">
            <View className="flex-row items-center gap-1 bg-primary-50 border border-primary-100 rounded-full px-3 py-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={
                    i < fullStars
                      ? "star"
                      : i === fullStars && hasHalfStar
                        ? "star-half"
                        : "star-outline"
                  }
                  size={14}
                  color={Colors.secondary[600]}
                />
              ))}
              <Text className="ml-1 text-dark text-xs font-popSb">
                {destination.rating?.toFixed(1) ?? "4.5"}
              </Text>
              <Text className="text-muted text-xs font-regular"> · 120 reviews</Text>
            </View>
          </View>

          {/* Tags */}
          {destination.tags?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5 -mx-1"
            >
              {destination.tags.map((tag, i) => (
                <View
                  key={i}
                  className="bg-primary-50 border border-primary-100 rounded-full px-3.5 py-1.5 mx-1.5 my-3"
                >
                  <Text className="text-primary-600 text-xs font-popSb">
                    #{tag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Divider */}
          <View className="h-px bg-gray-100 mb-5" />

          {/* About */}
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-1 h-5 bg-primary-500 rounded-full" />
            <Text className="text-base font-popBold text-dark">About</Text>
          </View>
          <Text className="text-muted leading-6 text-[15px] font-regular">
            {destination.description ??
              "This is a beautiful destination you will love to explore. Enjoy amazing views, culture, and unforgettable experiences."}
          </Text>

          <ChatCard
            chatInput={chatInput}
            setChatInput={setChatInput}
            messages={messages}
            handleSendChat={handleSendChat}
            onDeleteMessage={handleDeleteMessage}
            onDeleteAll={handleDeleteAllChats}
            streamingMessageId={streamingMessageId}
          />

          {/* Map */}
          <TouchableOpacity
            className="w-full h-[400px] rounded-xl overflow-hidden my-5 relative"
            onPress={() =>
              router.push({
                pathname: "/(modals)/MapContainerView",
                params: { DestinationId: String(destination.id) },
              })
            }
            style={DefaultStyles.shadow}
          >
            <View
              className="absolute right-2 top-2 bg-background rounded-full p-3 z-10"
              style={DefaultStyles.shadow}
            >
              <AntDesign name="arrows-alt" size={18} color={isDark ? 'white' : 'black'} />
            </View>
            <MapView
              style={{ width: "100%", height: "100%" }}
              provider="google"
              pointerEvents="none"
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              showsBuildings={true}
              initialRegion={{
                latitude: destination.latitude,
                longitude: destination.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                flat={true}
              >
                <View
                  style={[
                    {
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      backgroundColor: Colors.primary[500],
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "visible",
                    },
                  ]}
                >
                  <Ionicons name="location" size={30} color="white" />
                </View>
              </Marker>
            </MapView>
          </TouchableOpacity>

          {/* Gallery */}
          {destination.images?.length > 1 && (
            <View className="mt-7">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-1 h-5 bg-primary-500 rounded-full" />
                  <Text className="text-base font-popBold text-dark">Gallery</Text>
                </View>
                <Text className="text-muted text-xs font-popSb">
                  {destination.images.length} photos
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-1"
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / 156);
                  setActiveImageIndex(index);
                }}
              >
                {destination.images.map((img, index) => (
                  <View
                    key={index}
                    className="mx-1 overflow-hidden rounded-2xl"
                    style={{ width: 148, height: 100 }}
                  >
                    <Image
                      source={{ uri: img }}
                      style={{ width: 148, height: 100 }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── BOTTOM CTA ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-surface border-t border-primary-100"
        style={{ paddingBottom: 28, paddingTop: 12, paddingHorizontal: 20 }}
      >
        <TouchableOpacity
          className="bg-primary-500 rounded-2xl py-5 items-center"
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/(modals)/BookingScreen",
              params: {
                destinationId: String(destination.id),
                destinationName: destination.name,
              },
            })
          }
        >
          <Text className="text-background font-popBold text-base tracking-wide">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>

      <AnimatedTouchableOpacity
        className="absolute bottom-32 left-1/2 -translate-x-1/2 p-3 bg-primary rounded-full"
        style={[DefaultStyles.shadow, touchableOpacityAnimatedStyle]}
        onPress={() => handleScrollToButtom()}
      >
        <Ionicons name="arrow-down" size={18} color="white" />
      </AnimatedTouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default DestinationDetailsScreen;
