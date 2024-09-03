export interface Message {
  id?: number;
  chat_id: number;
  sender_id: number;
  content: string;
  created_at?: number;
  likes?: number;
  liked_by?: number[];
  liked_by_current_user?: boolean;
  reply_to_id: number
}
