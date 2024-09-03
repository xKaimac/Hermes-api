import { Server, Socket } from 'socket.io';

import { ChatValues } from '../../../shared/types/ChatValues';
import { Message } from '../../../shared/types/Message';

let io: Server;
const userSocketMap = new Map<string, string>();

export const initializeSocket = (socketIo: Server) => {
  io = socketIo;

  io.on('connection', (socket: Socket) => {
    socket.on('authenticate', (data: { user_id: number }) => {
      if (data && typeof data.user_id === 'number') {
        userSocketMap.set(data.user_id.toString(), socket.id);
        socket.join(data.user_id.toString());
      } else {
        console.error('Invalid authentication data:', data);
      }
    });

    socket.on('disconnect', () => {
      for (const [user_id, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(user_id);
          socket.leave(user_id.toString());
          break;
        }
      }
    });
  });
};

export const emitFriendRequest = (recipientId: number, senderId: string) => {
  if (typeof recipientId === 'number') {
    io.to(recipientId.toString()).emit('friendRequest', {
      type: 'friendRequest',
      senderId: senderId,
    });
  } else {
    console.error('Invalid recipientId:', recipientId);
  }
};

export const emitNewChat = (members: number[], chatData: ChatValues) => {
  members.forEach((user_id) => {
    if (typeof user_id === 'number') {
      io.to(user_id.toString()).emit('newChat', chatData);
    } else {
      console.error('Invalid user_id in members array:', user_id);
    }
  });
};

export const emitNewMessage = (
  members: number[],
  messageData: Message | undefined
) => {
  members.forEach((user_id) => {
    if (typeof user_id === 'number') {
      io.to(user_id.toString()).emit('newMessage', messageData);
    } else {
      console.error('Invalid user_id in members array:', user_id);
    }
  });
};

export const emitMessageLikeUpdate = (
  members: number[],
  messageData: Message
) => {
  members.forEach((user_id) => {
    if (typeof user_id === 'number') {
      io.to(user_id.toString()).emit('messageLikeUpdate', messageData);
    } else {
      console.error('Invalid user_id in members array:', user_id);
    }
  });
};

export const emitChatPictureUpdate = (
  members: number[],
  chat: ChatValues
) => {
  members.forEach((user_id) => {
    if (typeof user_id === 'number') {
      io.to(user_id.toString()).emit('chatPictureUpdate', chat);
    } else {
      console.error('Invalid user_id in members array:', user_id);
    }
  });
};

export const emitChatNameUpdate = (
  members: number[],
  chat: ChatValues
) => {
  members.forEach((user_id) => {
    console.log("sending to...." + user_id)
    if (typeof user_id === 'number') {
      io.to(user_id.toString()).emit('chatNameUpdate', chat);
    } else {
      console.error('Invalid user_id in members array:', user_id);
    }
  });
};
