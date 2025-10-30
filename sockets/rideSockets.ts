import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initRideSocket = (rideId: string) => {
  if (!socket) {
    console.log("Reached here in socket!");
    socket = io("http://192.168.1.119:3000");

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id); // <-- now it will have a value
      socket?.emit("joinRide", rideId); // join room for this ride
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized!");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
