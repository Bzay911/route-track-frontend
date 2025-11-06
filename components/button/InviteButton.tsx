import { API_BASE_URL } from "../../config/apiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InviteButtonProps {
  id: string; // its the groupId
}

const InviteButton: React.FC<InviteButtonProps> = ({ id }) => {
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { token } = useAuth();

  const showInviteInfo = () => {
    Alert.alert(
      "How to Invite Members",
      "• Enter the email address of the person you want to invite\n\n• If they already have an account, they'll be added immediately\n\n• If they don't have an account, they'll receive an invitation email\n\n• They can join the group by downloading the app and signing up",
      [{ text: "Got it!", style: "default" }]
    );
  };

  const handleInviteUser = async () => {
    if (!inviteeEmail || !inviteeEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }
    setIsInviting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/addRider`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          inviteeEmail: inviteeEmail,
        }),
      });

      const data = await response.json();
      console.log("Invite User Response:", data);

      // show backend message directly
      Alert.alert(
        response.ok ? "Success" : "Error",
        data.message || data.error || "Something went wrong",
        [
          {
            text: "OK",
            onPress: () => {
              if (response.ok) {
                setInviteeEmail("");
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error inviting user:", error);
      Alert.alert("Error", "Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  return (
      <>
    {/* <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}> */}
      {/* Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-interBold" style={{color:"#0A0A0A"}}>Invite Rider</Text>
        <TouchableOpacity className="p-2" onPress={showInviteInfo}>
          <Ionicons name="help-circle" size={20} color="#7B3FE4" />
        </TouchableOpacity>
      </View>

      {/* Email Input */}
      <TextInput
        className="rounded-lg p-3 shadow-lg mb-4 text-black bg-white text-base"
        placeholder="someone@gmail.com"
        placeholderTextColor="#9ca3af"
        value={inviteeEmail}
        onChangeText={setInviteeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Invite Button */}
      <TouchableOpacity
        className={`shadow-lg rounded-xl mt-3 ${isInviting ? "opacity-70" : ""}`}
        style={{ backgroundColor: "#7B3FE4" }}
        onPress={handleInviteUser}
        disabled={isInviting}
      >
        <Text className="text-white font-interMedium text-center py-4">
          {isInviting ? "Sending..." : "Send Invitation"}
        </Text>
      </TouchableOpacity>
      {/* </ScrollView> */}
      </>

  );
};

export default InviteButton;
