import { API_BASE_URL } from "../../config/apiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View>
      {/* Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-xl font-bold">Invite Rider</Text>
        <TouchableOpacity className="p-2" onPress={showInviteInfo}>
          <Ionicons name="help-circle" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Email Input */}
      <TextInput
        className="border border-white rounded-lg p-3 mb-4 text-white text-base"
        placeholder="someone@gmail.com"
        placeholderTextColor="#64748b"
        value={inviteeEmail}
        onChangeText={setInviteeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Invite Button */}
      <TouchableOpacity
        className={`bg-yellow-500 rounded-lg mt-3 ${isInviting ? "opacity-70" : ""}`}
        onPress={handleInviteUser}
        disabled={isInviting}
      >
        <Text className="text-white font-bold text-center py-4">
          {isInviting ? "Sending..." : "Send Invitation"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
// const styles = StyleSheet.create({
//   inviteBtn: {
//     backgroundColor: "#f59e0b",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   inviteBtnText: {
//     color: "white",
//     fontWeight: "bold",
//     textAlign: "center",
//     padding: 8,
//   },
//   emailInput: {
//     borderWidth: 1,
//     borderColor: "white",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     color: "white",
//   },
//   inviteBtnDisabled: {
//     opacity: 0.7,
//   },
//   memberItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 12,
//   },
//   memberName: {
//     fontSize: 16,
//   },
//   memberEmail: {
//     fontSize: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     color: "white",
//   },
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   infoButton: {
//     padding: 8,
//   },
// });
export default InviteButton;
