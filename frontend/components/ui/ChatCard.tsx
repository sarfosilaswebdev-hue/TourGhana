import { Colors } from "@/contants/colors";
import { DefaultStyles } from "@/contants/contants";
import { Message } from "@/Utils/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import {
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
};

const ChatCard = ({ chatInput, setChatInput, messages, handleSendChat }: ChatCardProps) => {
  const suggestedQuestions = [
    "What are the top attractions in this destination?",
    "What is the best time to visit?",
    "What local dishes should I try?",
    "Are there any cultural festivals happening soon?",
    "What are some hidden gems to explore?",
  ];

  return (
    <View
      className="w-full min-h-[400px] rounded-2xl my-5 bg-white border border-gray-100 p-5"
      style={DefaultStyles.shadow}
    >
      {messages.length === 0 ? (
        <View>
          <View className="items-center gap-3">
            <View className="bg-primary-50 p-3 rounded-full">
              <AntDesign name="open-ai" size={24} color={Colors.primary[500]} />
            </View>
            <Text className="text-gray-700 text-center leading-6">
              AI-generated description: A must-visit destination for travelers.
            </Text>
          </View>
          <View>
            <Text className="text-gray-500 text-lg mt-3 font-popSb">
              Suggested Discoveries
            </Text>
            {suggestedQuestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                className="items-center gap-3 mt-3 bg-gray-100 rounded-full p-4 border border-primary-300/50"
              >
                <Text className="text-primary-300">{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          scrollEnabled={false}
          className="flex-col gap-3"
          renderItem={({ item }) => (
            <View
              key={item.id}
              className={`max-w-[85%] p-4 rounded-3xl my-3  ${
                item.role === "user"
                  ? "self-end bg-primary-500"
                  : "self-start "
              }`}
            >
              <Text
                className={`${item.role === "user" ? "text-white" : "text-gray-700"} font-popSb `}
              >
                {item.content}
              </Text>
            </View>
          )}
        />
      )}

      <View className=" my-5 border border-gray-200 rounded-xl p-2 flex-row items-center gap-3 justify-between">
        <TextInput
          placeholder="Ask about this destination"
          placeholderTextColor={"gray"}
          onChangeText={(text) => setChatInput(text)}
          value={chatInput}
        />
        <TouchableOpacity className=" bg-primary-500 p-2 rounded-full" onPress={() => handleSendChat()}>
          <Ionicons name="arrow-up" size={16} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatCard;

const styles = StyleSheet.create({});
