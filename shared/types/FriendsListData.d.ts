import { User } from "./User";

export interface FriendsListData {
  confirmedFriends: User[];
  outgoingRequests: User[];
  incomingRequests: User[];
}