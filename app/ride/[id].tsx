import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import formatDate from "@/utils/FormatDate";
import formatTime from "@/utils/FormatTime";

type Tab = "members" | "invite";

export default function Details() {
  const { name, description, destination, date, time } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");

  // Dummy data for demonstration
  const members = [
    { id: 1, name: "Mike Johnson", email: "mike32@gmail.com" },
    { id: 2, name: "Sarah Wilson", email: "sarah.w@gmail.com" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1f3a" }}>
      <ScrollView className="flex-1">
        {/* Group Details Card */}
        <View className="mx-6">
          <View className="bg-white/10 rounded-2xl p-6">
            <Text className="text-white text-2xl font-bold mb-2">{name}</Text>
            <Text className="text-white/70 text-base mb-4">
              {description || "Welcome to the group"}
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatDate(date as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatTime(time as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">{destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-6 mt-8 mb-4 bg-white/5 rounded-2xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setActiveTab("members")}
            className={`flex-1 py-2 ${
              activeTab === "members" ? "bg-blue-500" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "members" ? "text-white" : "text-white/70"
              }`}
            >
              Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("invite")}
            className={`flex-1 py-2 ${
              activeTab === "invite" ? "bg-blue-500" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "invite" ? "text-white" : "text-white/70"
              }`}
            >
              Invite
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Content */}
        <View className="mx-6 mt-4">
          {activeTab === "members" ? (
            // Members List
            <View>
              {members.map((member) => (
                <View
                  key={member.id}
                  className="bg-white/10 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold">
                        {member.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white font-semibold">
                        {member.name}
                      </Text>
                      <Text className="text-white/70">{member.email}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // Invite Section
            <View>
              {/* Search Bar */}
              <View className="bg-white/10 rounded-lg flex-row items-center px-4 mb-4">
                <Ionicons name="search" size={20} color="white" />
                <TextInput
                  className="flex-1 py-3 px-2 text-white"
                  placeholder="Search by name or email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
           
              <TouchableOpacity className="bg-blue-500 rounded-lg py-4 items-center mt-4">
                <Text className="text-white font-semibold">Search Rider</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
