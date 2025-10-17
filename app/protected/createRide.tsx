import { API_BASE_URL } from "@/config/apiConfig";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const createRide = () => {
  const [rideName, setRideName] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      // Store the Date object directly - no conversion needed!
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      // Store the Date object directly - no conversion needed!
      setSelectedTime(time);
    }
  };
  
  const handleCreateRide = async () => {
    // Validate required fields
    if (!rideName.trim()) {
        Alert.alert("Error", "Please enter a ride name");
        return;
    }
    
    if (!destination.trim()) {
        Alert.alert("Error", "Please enter a destination");
        return;
    }
    
    if (!selectedDate) {
        Alert.alert("Error", "Please select a date");
        return;
    }
    
    if (!selectedTime) {
        Alert.alert("Error", "Please select a time");
        return;
    }

    try{
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/rides/create-ride`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rideName,
                destination,
                selectedDate: selectedDate?.toISOString(),
                selectedTime: selectedTime?.toISOString(),
                description
            }),
        });
        if(!response.ok){
            throw new Error("Failed to create ride");
        }
        const data = await response.json();
        setIsLoading(false);
        console.log(data);
        Alert.alert("Ride created successfully");
        router.push("/");
    } catch (error) {
        console.error("Error creating ride:", error);
        Alert.alert("Error", "Failed to create ride. Please try again.");
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a1f3a" }}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Ride Name Input */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3">
            Ride Name
          </Text>
          <TextInput
            value={rideName}
            onChangeText={setRideName}
            placeholder="e.g. Weekend Coastal Run"
            placeholderTextColor="#9CA3AF"
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-base"
          />
        </View>

        {/* Destination Input */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3">
            Destination
          </Text>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Pacific Coast Highway"
            placeholderTextColor="#9CA3AF"
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-base"
          />
        </View>

        {/* Date Input */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3">Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text
              className={`ml-3 text-base ${selectedDate ? "text-white" : "text-gray-400"}`}
            >
              {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
            </Text>
          </TouchableOpacity>

           {showDatePicker && (
             <DateTimePicker
               value={new Date()}
               mode="date"
               display={Platform.OS === "ios" ? "spinner" : "default"}
               onChange={handleDateChange}
               textColor="white"
               themeVariant="dark"
               style={{ backgroundColor: '#1a1f3a' }}
             />
           )}
        </View>

        {/* Time Input */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3">Time</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 flex-row items-center"
          >
            <Ionicons name="time-outline" size={20} color="white" />
            <Text
              className={`ml-3 text-base ${selectedTime ? "text-white" : "text-gray-400"}`}
            >
              {selectedTime ? selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Select time"}
            </Text>
          </TouchableOpacity>
           {showTimePicker && (
             <DateTimePicker
               value={new Date()}
               mode="time"
               display={Platform.OS === "ios" ? "spinner" : "default"}
               onChange={handleTimeChange}
               textColor="white"
               themeVariant="dark"
               style={{ backgroundColor: '#1a1f3a' }}
             />
           )}
        </View>

        {/* Description Input */}
        <View className="mb-8">
          <Text className="text-white text-base font-medium mb-3">
            Description (Optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add details about the ride, route highlights or what riders should bring..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-base"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* Create Ride Button */}
        <TouchableOpacity 
          style={{ backgroundColor: '#ff6b36' }}
          className="border border-white/20 rounded-xl py-4 items-center mb-8"
          onPress={handleCreateRide}
        >
          <Text className="text-white text-lg font-semibold">{isLoading ? "Creating Ride" : "Create Ride"}</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

export default createRide;
