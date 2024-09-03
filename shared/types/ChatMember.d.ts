import { User } from './User';

export interface ChatMember extends User {
  role: 'admin' | 'regular';
  joined_at?: number;
}
