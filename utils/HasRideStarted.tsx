import { Ride } from "@/types/ride";

export default function hasRideStarted(ride: Ride) {

  const now = new Date();
  // compares current date and time with ride date and time
  if (ride.rideDate && ride.rideTime) {
    const rideDate = new Date(ride.rideDate);
    const rideTime = new Date(ride.rideTime);

    // Combine the hours and minutes from rideTime into rideDate
    rideDate.setHours(rideTime.getHours());
    rideDate.setMinutes(rideTime.getMinutes());
    rideDate.setSeconds(0);
    rideDate.setMilliseconds(0);

     return now >= rideDate;
  }
}
