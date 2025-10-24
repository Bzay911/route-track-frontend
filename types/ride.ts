import { User } from "./user";

export interface Ride {
  _id: string;
  rideName: string;
  rideDescription?: string;
  rideDestination: string;
  rideDate?: string;
  rideTime: string;
  riders: User[];
  createdby?: string;
  createdAt: string;
}