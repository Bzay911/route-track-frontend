import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {API_BASE_URL} from '../../config/apiConfig';
import { useState } from "react";

const LoginScreen = () => {
   const { login } = useAuth();
     const [googleLoading, setGoogleLoading] = useState(false);

  GoogleSignin.configure({
    webClientId:
      "721642212635-u263q528v8p06s6cpakjg5j3ovk4027k.apps.googleusercontent.com",
      iosClientId:"721642212635-kr715gh53ev4r1j660388vif7rqsdeb7.apps.googleusercontent.com"
  });

  const googleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (!idToken) return;
        await handleGoogleSignin(idToken);
      } else {
        console.log(`Sign in cancelled by user: ${response.data}`);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Login in progress", error.message);
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play service not available", error.message);
            break;
          default:
            console.log(`Something else ${error.message}`);
            console.log(`Something else ${error.code}`);
        }
      }
    }
  };

  const handleGoogleSignin = async (idToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/handleGoogleSignin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Login failed", data.message);
        return;
      }
      login(data.appToken, data.user);
      console.log("Login successful", data.appToken);
    } catch (error) {
      console.log(`error from handleSignin: ${error}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      {/* App Name */}
      <Text className="text-4xl font-extrabold text-gray-900 mb-10">
        RouteTrack
      </Text>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        onPress={googleSignIn}
        className="flex-row items-center justify-center bg-white border border-gray-300 rounded-2xl p-4 w-full max-w-sm shadow-md"
        activeOpacity={0.8}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Image
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZfGyEcEdPfzca-b4iATLHuHIk80_yYMtRWw&s",
          }}
          className="w-6 h-6 mr-3"
        />
        <Text className="text-base font-semibold text-gray-700">
          Sign in with Google
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;
