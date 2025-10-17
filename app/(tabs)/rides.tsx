import RideCard from '@/components/RideCard';
import { useRide } from '@/contexts/RideContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rides = () => {
  const { rides, isLoading, error } = useRide();
  
  // If it's loading and data fetching
  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" />
        <Text className='text-gray-500 mt-2'>Loading rides...</Text>
      </View>
    );
  }

  // If any error occurs
  if (error) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-red-500'>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#1a1f3a' }}>
      <View className='pt-4 pb-2 px-4'>
        <Text className='text-2xl font-bold text-white'>Rides</Text>
      </View>
      
      {rides && rides.length > 0 ? (
        <ScrollView 
          className='flex-1'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {rides.map((ride, index) => {
            return (
              <RideCard key={ride.id || `ride-${index}`} ride={ride} />
            );
          })}
        </ScrollView>
      ) : (
        <View className='flex-1 items-center justify-center px-4'>
          <Ionicons name="bicycle-outline" size={64} color="#9CA3AF" />
          <Text className='text-gray-500 text-lg mt-4 text-center'>
            No rides found
          </Text>
          <Text className='text-gray-400 text-sm mt-2 text-center'>
            Check back later for new rides
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default rides