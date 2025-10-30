import { View, Text } from 'react-native';

const LobbyRiderCard = (rider: any) => {
  return (
    <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-gray-200 shadow-sm relative">
      {/* Left Section: Avatar + Info */}
      <View className="flex-row items-center flex-1">
        {/* Avatar */}
        <View className="bg-cyan-400 rounded-full w-12 h-12 items-center justify-center mr-4">
          <Text className="text-xl font-bold">
            {rider.user.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>

        {/* Name and Details */}
        <View className="flex-1">
          {/* Name Row */}
          <Text className="text-gray-900 text-medium font-semibold mb-1">
            {rider.user.email}
          </Text>

          {/* Distance and ETA Row */}
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-sm">16km</Text>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-600 text-sm">32 mins</Text>
          </View>
        </View>
      </View>

      {/* Right Section: Status Badge */}
      <View
        className={`rounded-full px-4 py-2 ${
          rider.ready ? 'bg-green-500' : 'bg-gray-200'
        }`}
      >
        <Text
          className={`text-sm ${
            rider.ready ? 'text-white' : 'text-gray-600'
          }`}
        >
          {rider.ready ? 'Ready' : 'Not Ready'}
        </Text>
      </View>
    </View>
  );
};

export default LobbyRiderCard;
