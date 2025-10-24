import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import formatDate from "../../../utils/FormatDate";
import formatTime from "../../../utils/FormatTime";
import InviteButton from "../../../components/button/InviteButton";
import { useRide } from "@/contexts/RideContext";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";

type Tab = "members" | "invite";

export default function Details() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const { fetchRideById } = useRide();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!id) return;
    const fetchRideDetails = async () => {
      setLoading(true);
      try{
        const data = await fetchRideById(id as string);
        setRide(data);
      }catch(error){
        console.error("Error fetching ride details:", error);
      }finally{
        setLoading(false);
      }
    }

    fetchRideDetails();
  }, [id]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1f3a" }}>
      <ScrollView className="flex-1">
        {/* Group Details Card */}
        <View className="mx-6">
          <View className="bg-white/10 rounded-2xl p-6">
            <Text className="text-white text-2xl font-bold mb-2">{ride?.rideName}</Text>
            <Text className="text-white/70 text-base mb-4">
              {ride?.rideDescription || "Welcome to the group"}
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatDate(ride?.rideDate as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatTime(ride?.rideTime as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">{ride?.rideDestination}</Text>
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
              {ride?.riders.map((rider: User) => (
                <View
                  key={rider._id}
                  className="bg-white/10 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold">
                        {rider.email.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white font-semibold">
                        {rider.name || "Unnamed Rider"}
                      </Text>
                      <Text className="text-white/70">{rider.email}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // Invite Section
            <InviteButton id={id as string} /> // sending as string for typescript compatibility
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
