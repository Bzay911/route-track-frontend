import { User } from "./user";

export interface Rider {
  _id: string;
  user: User;
  ready: boolean;
}

export interface Ride {
  _id: string;
  rideName: string;
  rideDescription?: string;
  rideDestination: string;
  destinationCoords: [number, number];
  rideDate?: string;
  rideTime: string;
  riders: Rider[]; 
  createdby?: string;
  createdAt: string;
}
