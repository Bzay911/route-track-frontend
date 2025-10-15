import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#1a1f3a' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4" style={{ backgroundColor: '#1a1f3a' }}>
        <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
          <Text className="text-white text-lg font-semibold">A</Text>
        </View>
        
        <View className="flex-1 items-center">
          <Text className="text-white/70 text-lg">Good morning</Text>
          <Text className="text-white text-lg font-semibold">Alex</Text>
        </View>
        
        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Next Ride Section */}
        <View className="mx-6 mt-6">
          <View className="bg-white/10 rounded-2xl p-6">
            <View className="bg-white/20 rounded-lg px-3 py-1 self-start mb-4">
              <Text className="text-white text-xs font-medium">Next Ride</Text>
            </View>
            
            <Text className="text-white text-2xl font-bold mb-2">Coastal Highway Run</Text>
            <Text className="text-white/70 text-base mb-6">Epic coastal ride with stunning ocean views.</Text>
            
            <View className="space-y-3 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">Dec 15, 2025</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">9:00 AM</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">Pacific Coast Highway</Text>
              </View>
            </View>
            
            <TouchableOpacity style={{ backgroundColor: '#ff6b36' }} className="rounded-xl py-4 items-center">
              <Text className="text-white font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Rides Section */}
        <View className="mx-6 mt-8">
          <Text className="text-white text-2xl font-bold mb-6">Upcoming Rides</Text>
          
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
              <Text className="text-white text-lg font-bold mb-4">Coastal Highway Run</Text>
              
              <View className="space-y-3 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={18} color="white" />
                  <Text className="text-white/70 ml-3 text-sm">Dec 15, 2025</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={18} color="white" />
                  <Text className="text-white/70 ml-3 text-sm">9:00 AM</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={18} color="white" />
                  <Text className="text-white/70 ml-3 text-sm">Pacific Coast Highway</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="bicycle-outline" size={16} color="white" />
                  <Text className="text-white/70 ml-2 text-sm">8 riders</Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: '#ff6b36' }} className="rounded-lg px-4 py-2">
                  <Text className="text-white text-sm font-medium">View on map</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity onPress={() => router.push('/protected/createRide')} className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={24} color="#1a1f3a" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

