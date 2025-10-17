import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

// Ride Card Component
const RideCard = ({ ride }: { ride: any }) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
  
    const formatTime = (timeString: string) => {
      if (!timeString) return '';
      const time = new Date(timeString);
      if (isNaN(time.getTime())) return 'Invalid Time';
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
  
    return (
      <View className='bg-white rounded-2xl shadow-lg p-4 mb-4 mx-4 border border-gray-100'>
        {/* Header with title and View on map button */}
        <View className='flex-row justify-between items-start mb-3'>
          <Text className='text-xl font-bold text-black flex-1 mr-3'>
            {ride.rideName}
          </Text>
          <TouchableOpacity className='bg-black rounded-lg px-3 py-2'>
            <Text className='text-white text-sm font-medium'>View on map</Text>
          </TouchableOpacity>
        </View>
  
        {/* Date and Time */}
        <View className='flex-row items-center mb-2'>
          <Ionicons name="calendar-outline" size={16} color="#000" />
          <Text className='text-black ml-2 mr-4'>
            {ride.rideDate ? formatDate(ride.rideDate) : 'TBD'}
          </Text>
          <Ionicons name="time-outline" size={16} color="#000" />
          <Text className='text-black ml-2'>
            {formatTime(ride.rideTime)}
          </Text>
        </View>
  
        {/* Location */}
        <View className='flex-row items-center mb-4'>
          <Ionicons name="location-outline" size={16} color="#000" />
          <Text className='text-black ml-2 flex-1'>
            {ride.rideDestination}
          </Text>
        </View>
  
        {/* Riders count */}
        <View className='flex-row justify-end items-center'>
          <Ionicons name="bicycle-outline" size={16} color="#000" />
          <Text className='text-black ml-2'>
            {ride.participants?.length || 0} riders
          </Text>
        </View>
      </View>
    );
  };

  export default RideCard;