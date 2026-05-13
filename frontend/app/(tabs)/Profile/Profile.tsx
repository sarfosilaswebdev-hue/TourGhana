import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth, useClerk } from "@clerk/expo";

const Profile = () => {
  const {signOut} = useClerk();
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={()=>signOut()} className="bg-primary p-4 rounded">
        <Text className="text-white font-bold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
