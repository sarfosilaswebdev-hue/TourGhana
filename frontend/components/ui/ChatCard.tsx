import { useThemeColors, AppColors } from "@/context/ThemeContext";
import { Message, MessageRole } from "@/Utils/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ChatCardProps = {
  chatInput: string;
  setChatInput: (text: string) => void;
  messages: Message[];
  handleSendChat: () => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteAll: () => void;
  streamingMessageId?: string | null;
};

const SUGGESTED = [
  "What are the top attractions here?",
  "Best time of year to visit?",
  "Local dishes I should try?",
  "Any upcoming cultural festivals?",
  "Hidden gems to explore?",
];

// ── Three bouncing dots shown while waiting for the first chunk ──
const TypingIndicator = () => {
  const C = useThemeColors();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -5,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.delay(480),
        ]),
      );

    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 160);
    const a3 = bounce(dot3, 320);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={indicatorStyles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            indicatorStyles.dot,
            { backgroundColor: C.primary[400], transform: [{ translateY: dot }] },
          ]}
        />
      ))}
    </View>
  );
};

// ── Blinking cursor shown while chunks are streaming in ──
const StreamingCursor = () => {
  const C = useThemeColors();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[indicatorStyles.cursor, { backgroundColor: C.primary[400], opacity }]}
    />
  );
};

// ── Helpers ──────────────────────────────────────────────────────
function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Main component ───────────────────────────────────────────────
const ChatCard = ({
  chatInput,
  setChatInput,
  messages,
  handleSendChat,
  onDeleteMessage,
  onDeleteAll,
  streamingMessageId,
}: ChatCardProps) => {
  const C = useThemeColors();
  const styles = useMemo(() => createStyles(C), [C]);

  const sorted = [...messages].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  type DateSep = { type: "sep"; label: string; key: string };
  type MsgItem = { type: "msg"; msg: Message };
  const items: (DateSep | MsgItem)[] = [];
  let lastDateLabel = "";
  for (const msg of sorted) {
    const label = formatDateLabel(msg.createdAt);
    if (label && label !== lastDateLabel) {
      items.push({ type: "sep", label, key: `sep-${label}-${msg.id}` });
      lastDateLabel = label;
    }
    items.push({ type: "msg", msg });
  }

  function confirmDeleteMessage(msg: Message) {
    if (!msg.id) return;
    Alert.alert("Delete message", "Remove this message from the conversation?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDeleteMessage(msg.id!) },
    ]);
  }

  function confirmDeleteAll() {
    Alert.alert(
      "Clear all chats",
      "This will permanently delete the entire conversation for this destination.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear all", style: "destructive", onPress: onDeleteAll },
      ],
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <AntDesign name="open-ai" size={16} color={C.primary[500]} />
          </View>
          <Text style={styles.headerTitle}>Ask the AI Guide</Text>
        </View>
        {sorted.length > 0 && (
          <TouchableOpacity
            onPress={confirmDeleteAll}
            style={styles.clearBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={C.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* Messages or empty state */}
      {sorted.length === 0 ? (
        <View>
          <Text style={styles.emptyLabel}>Suggested questions</Text>
          {SUGGESTED.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionBtn}
              activeOpacity={0.75}
              onPress={() => setChatInput(q)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color={C.primary[400]}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.suggestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, idx) =>
            item.type === "sep" ? item.key : (item.msg.id ?? idx.toString())
          }
          scrollEnabled={false}
          renderItem={({ item }) => {
            if (item.type === "sep") {
              return (
                <View style={styles.dateSepRow}>
                  <View style={styles.dateSepLine} />
                  <Text style={styles.dateSepLabel}>{item.label}</Text>
                  <View style={styles.dateSepLine} />
                </View>
              );
            }

            const { msg } = item;
            const isUser = msg.role === MessageRole.USER;
            const isStreaming = msg.id === streamingMessageId;
            const isThinking = isStreaming && msg.content === "";

            return (
              <TouchableOpacity
                onLongPress={() => confirmDeleteMessage(msg)}
                activeOpacity={0.85}
                delayLongPress={400}
              >
                <View
                  style={[
                    styles.bubbleWrap,
                    isUser ? styles.bubbleWrapRight : styles.bubbleWrapLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleAssistant,
                      isThinking && styles.bubbleThinking,
                    ]}
                  >
                    {isThinking ? (
                      // ── Waiting for first chunk: bouncing dots ──
                      <TypingIndicator />
                    ) : isStreaming ? (
                      // ── Chunks arriving: text + blinking cursor ──
                      <View style={styles.streamingRow}>
                        <Text style={[styles.bubbleText, styles.bubbleTextAssistant]}>
                          {msg.content}
                        </Text>
                        <StreamingCursor />
                      </View>
                    ) : (
                      // ── Finished or user message ──
                      <Text
                        style={[
                          styles.bubbleText,
                          isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                        ]}
                      >
                        {msg.content}
                      </Text>
                    )}
                  </View>

                  {/* Timestamp — hide while still streaming */}
                  {msg.createdAt && !isStreaming && (
                    <Text
                      style={[
                        styles.timestamp,
                        isUser ? styles.timestampRight : styles.timestampLeft,
                      ]}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Ask about this destination…"
          placeholderTextColor={C.muted}
          onChangeText={setChatInput}
          value={chatInput}
          style={styles.input}
          onSubmitEditing={handleSendChat}
          returnKeyType="send"
          multiline={false}
          editable={!streamingMessageId}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!chatInput.trim() || !!streamingMessageId) && styles.sendBtnDisabled,
          ]}
          onPress={handleSendChat}
          activeOpacity={0.8}
          disabled={!chatInput.trim() || !!streamingMessageId}
        >
          {streamingMessageId ? (
            // Small pulsing dot while streaming instead of arrow
            <Animated.View style={styles.streamingDot} />
          ) : (
            <Ionicons name="arrow-up" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatCard;

// Static styles for sub-components that use inline color props
const indicatorStyles = StyleSheet.create({
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  cursor: { width: 2, height: 14, borderRadius: 1, marginLeft: 2, marginBottom: 2 },
});

const createStyles = (C: AppColors) =>
  StyleSheet.create({
    card: {
      width: "100%",
      backgroundColor: C.surface,
      borderRadius: 16,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: C.primary[100],
      overflow: "hidden",
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: C.primary[50],
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: C.dark },
    clearBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(239,68,68,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    divider: { height: 1, backgroundColor: C.primary[100] },

    // Empty state
    emptyLabel: {
      fontFamily: "PoppinsSemiBold",
      fontSize: 11,
      color: C.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    suggestionBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 12,
      marginBottom: 6,
      backgroundColor: C.primary[50],
      borderWidth: 1,
      borderColor: C.primary[100],
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    suggestionText: { fontFamily: "PoppinsRegular", fontSize: 13, color: C.primary[600], flex: 1 },

    // Date separator
    dateSepRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
      paddingHorizontal: 16,
      gap: 8,
    },
    dateSepLine: { flex: 1, height: 1, backgroundColor: C.primary[100] },
    dateSepLabel: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: C.muted, letterSpacing: 0.5 },

    // Bubbles
    bubbleWrap: { paddingHorizontal: 12, marginBottom: 2 },
    bubbleWrapRight: { alignItems: "flex-end" },
    bubbleWrapLeft: { alignItems: "flex-start" },
    bubble: {
      maxWidth: "82%",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 6,
    },
    bubbleUser: { backgroundColor: C.primary[500], borderBottomRightRadius: 4 },
    bubbleAssistant: { backgroundColor: C.primary[50], borderBottomLeftRadius: 4 },
    bubbleThinking: { paddingVertical: 12, paddingHorizontal: 16 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { fontFamily: "PoppinsRegular", color: "#fff" },
    bubbleTextAssistant: { fontFamily: "PoppinsRegular", color: C.dark },
    streamingRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" },
    timestamp: { fontFamily: "PoppinsRegular", fontSize: 10, color: C.muted, marginTop: 2, marginBottom: 4 },
    timestampRight: { marginRight: 4 },
    timestampLeft: { marginLeft: 4 },

    // Streaming dot in send button
    streamingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "white" },

    // Input row
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: C.primary[100],
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    input: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 14, color: C.dark, paddingVertical: 6 },
    sendBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: C.primary[500],
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: C.primary[200] },
  });
