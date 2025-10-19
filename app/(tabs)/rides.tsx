import RideCard from "@/components/RideCard";
import { useRide } from "@/contexts/RideContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Rides = () => {
  const { rides, isLoading, error } = useRide();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "today" | "upcoming" | "past"
  >("all");

  const filters = ["all", "today", "upcoming", "past"] as const;

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`mr-3 px-4 py-2 rounded-full border ${
              isActive
                ? "bg-blue-500 border-blue-500"
                : "bg-transparent border-white/30"
            }`}
          >
            <Text
              className={`font-semibold ${isActive ? "text-white" : "text-white/70"}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // If it's loading and data fetching
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-gray-500 mt-2">Loading rides...</Text>
      </View>
    );
  }

  // If any error occurs
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a1f3a" }}>
      <View className="pt-4 pb-2 px-4">
        <Text className="text-2xl font-bold text-white">Rides</Text>
      </View>
      <View className="mb-4">{renderFilterChips()}</View>

      {rides && rides.length > 0 ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {rides.map((ride, index) => {
            return <RideCard key={ride._id || `ride-${index}`} ride={ride} />;
          })}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="bicycle-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            No rides found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Check back later for new rides
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Rides;
