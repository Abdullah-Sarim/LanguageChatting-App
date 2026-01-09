import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json({
      success: true,
      friends: user?.friends || [],
    });
  } catch (error) {
    console.error("getMyFriends error:", error);
    res.status(500).json({
      success: false,
      friends: [], // 🔥 ALWAYS return array
    });
  }
}

export const searchUsers = async (req, res) => {
  const q = req.query.q;

  if (!q) return res.json([]);

  const users = await User.find({
    fullName: { $regex: q, $options: "i" },
    _id: { $ne: req.user.id },
  })
    .select("fullName profilePic nativeLanguage learningLanguage")
    .limit(10);

  res.json(users);
};


// export const removeFriend = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { friendId } = req.params;

//     // remove friend from both users
//     await User.findByIdAndUpdate(userId, {
//       $pull: { friends: friendId },
//     });

//     await User.findByIdAndUpdate(friendId, {
//       $pull: { friends: userId },
//     });

//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to remove friend" });
//   }
// };

export const removeFriend = async (req, res) => {
  try {
    const myId = req.user.id;
    const { friendId } = req.params;

    // 1️⃣ Remove friendship (CRITICAL)
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId },
    });

    // 2️⃣ Clean up friend requests (NON-CRITICAL)
    try {
      await FriendRequest.deleteMany({
        $or: [
          { sender: myId, recipient: friendId },
          { sender: friendId, recipient: myId },
        ],
      });
    } catch (cleanupError) {
      console.warn(
        "Friend removed but failed to clean FriendRequest:",
        cleanupError.message
      );
    }

    // ✅ ALWAYS return success if friendship is removed
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error.message);
    return res.status(500).json({ message: "Failed to remove friend" });
  }
};


// export async function updatedUser(req, res){
//   try{
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       ...req.body,
//       { new: true }
//     ).select("-password");
//     res.status(200).json({ message: "User profile updated", updatedUser});
//   } catch(error) {
//     console.error("Error in updateUser controller", error)
//     res.status(500).json({ message: "Internal Server Error", error:error.message, });
//   }
// }

// export const updatedUser = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const {
//       fullName,
//       bio,
//       location,
//       profilePic,
//       nativeLanguage,
//       learningLanguage,
//     } = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         fullName,
//         bio,
//         location,
//         profilePic,
//         nativeLanguage,
//         learningLanguage,
//       },
//       { new: true }
//     ).select("-password");

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Update profile error:", error);

//     res.status(500).json({
//       message: "Failed to update profile",
//       error: error.message,
//     });
//   }
// };

export const updatedUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      bio,
      location,
      profilePic,
      nativeLanguage,
      learningLanguage,
    } = req.body;

    /*VALIDATION*/

    //Validate allowed languages
    // if (
    //   nativeLanguage &&
    //   !LANGUAGES.includes(nativeLanguage)
    // ) {
    //   return res.status(400).json({
    //     message: "Invalid native language selected",
    //   });
    // }

    // if (
    //   learningLanguage &&
    //   !LANGUAGES.includes(learningLanguage)
    // ) {
    //   return res.status(400).json({
    //     message: "Invalid learning language selected",
    //   });
    // }

    //Prevent same language
    if (
      nativeLanguage &&
      learningLanguage &&
      nativeLanguage === learningLanguage
    ) {
      return res.status(400).json({
        message: "Native language and learning language cannot be the same",
      });
    }

    /*UPDATE OBJECT (SAFE)*/

    //optional to do -------------------
    const updates = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (profilePic !== undefined) updates.profilePic = profilePic;
    if (nativeLanguage !== undefined) updates.nativeLanguage = nativeLanguage;
    if (learningLanguage !== undefined)
      updates.learningLanguage = learningLanguage;
    //----------------------------------------
    //             if not do then
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   {
    //     fullName,
    //     bio,
    //     location,
    //     profilePic,
    //     nativeLanguage,
    //     learningLanguage,
    //   },
    //   { new: true }
    // ).select("-password");

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "A friend request already exists between you and this user",
        });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
