import express from 'express';

import { isAuthenticated } from '../../middleware/auth.middleware';
import sendFriendRequest from '../../services/friends/addFriend.service';
import findFriend from '../../services/friends/findFriend';
import getFriends from '../../services/friends/getFriends';
import handleFriendRequest from '../../services/friends/handleFriendRequest.service';
import { emitFriendRequest } from '../../services/socket/socket.service';

const router = express.Router();

router.post('/add-friend', isAuthenticated, async (req, res) => {
  try {
    const { user_id, friendName } = req.body;
    const result = await sendFriendRequest(user_id, friendName);

    if (result.success) {
      emitFriendRequest(result.friend_id, user_id);

      return res.status(200).json({
        message: 'Friend request sent successfully',
        result: result.success,
      });
    } else {
      return res
        .status(400)
        .json({ message: 'Failed to send friend request', result: false });
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    res
      .status(500)
      .json({ message: 'Error sending friend request', error: error });
  }
});

router.post('/get-friends', isAuthenticated, async (req, res) => {
  try {
    const { user_id } = req.body;
    const result = await getFriends(user_id);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ message: 'Error getting friends' });
  }
});

router.post('/find-friend', isAuthenticated, async (req, res) => {
  try {
    console.log(req.body)
    const { user_id, friendName } = req.body;
    const friend = await findFriend(user_id, friendName);

    if (!friend) throw new Error();

    return res.status(200).json({ result: friend });
  } catch (error) {
    console.error('Error finding friend: ', error);

    return res.status(500).json({ message: 'Error finding friend' });
  }
});

router.post('/handle-friend-request', isAuthenticated, async (req, res) => {
  try {
    const { action, user_id, friend_id } = req.body;
    const result = await handleFriendRequest(action, user_id, friend_id);

    return res.status(200).json({
      message: `Friend request handled successfully`,
      result: result,
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ message: `Failed to handle friend request`, error: error });
  }
});

export default router;
