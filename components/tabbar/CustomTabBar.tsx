import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Check if current route is 'index' (home screen)
  const currentRoute = state.routes[state.index];
  const isHomeScreen = currentRoute.name === "index";

  // SVG path with curve for home screen
  const curvedPath =
    "M 20 0 H 150 C 170 0 162 20.8 198 24 C 236 22.4 230 0 250 0 H 386 Q 406 0 406 16 V 64 Q 406 80 386 80 H 20 Q 0 80 0 64 V 16 Q 0 0 20 0 Z";

  // SVG path straight (no curve) for other screens
  const straightPath =
    "M 20 0 H 386 Q 406 0 406 16 V 64 Q 406 80 386 80 H 20 Q 0 80 0 64 V 16 Q 0 0 20 0 Z";

  return (
    <View
      className="absolute bottom-[-3] w-full px-4" // Added px-4 for left/right spacing
    >
      <View
        style={{
          shadowColor: "#7437ff",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
        className="relative"
      >
        {/* SVG Background */}
        <Svg
          height={100}
          width={SCREEN_WIDTH - 32} // Full width minus padding (16px on each side)
          viewBox="0 0 406 100"
          preserveAspectRatio="none"
        >
          <Path d={isHomeScreen ? curvedPath : straightPath} fill="white" />
        </Svg>

        {/* Tab buttons */}
        <View className="flex-row items-center justify-around absolute bottom-8 w-full h-[60px] px-3">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            // Handle label properly - it could be a string or a function
            let label: string;
            if (typeof options.tabBarLabel === "function") {
              label = route.name; // Fallback to route name if it's a function
            } else if (typeof options.tabBarLabel === "string") {
              label = options.tabBarLabel;
            } else if (typeof options.title === "string") {
              label = options.title;
            } else {
              label = route.name;
            }

            const Icon = options.tabBarIcon
              ? options.tabBarIcon({
                  color: isFocused ? "#7437ff" : "gray",
                  size: 24,
                  focused: isFocused,
                })
              : null;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                className="items-center justify-center"
              >
                {Icon}
                <Text style={{ color: isFocused ? "#7437ff" : "gray" }} className="text-[12px] font-interRegular">
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default CustomTabBar;
