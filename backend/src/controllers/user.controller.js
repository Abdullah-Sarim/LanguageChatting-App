import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Rating from "../models/Rating.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = String(req.user._id);
    const currentUser = req.user;
    const { minRating, nativeLanguage, learningLanguage, bestMatch } = req.query;

    const friendsArray = Array.isArray(currentUser.friends) ? currentUser.friends.map(f => String(f)) : [];
    const excludeIds = [currentUserId, ...friendsArray];
    
    const query = {
      _id: { $nin: excludeIds },
      isOnboarded: true,
    };

    if (nativeLanguage) {
      query.nativeLanguage = { $regex: new RegExp(`^${nativeLanguage}$`, 'i') };
    }
    if (learningLanguage) {
      query.learningLanguage = { $regex: new RegExp(`^${learningLanguage}$`, 'i') };
    }
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    let recommendedUsers = await User.find(query).select("fullName profilePic nativeLanguage learningLanguage bio location averageRating totalRatings");

    recommendedUsers = recommendedUsers.map(user => {
      let matchType = "none";
      
      const userNative = user.nativeLanguage?.toLowerCase();
      const userLearning = user.learningLanguage?.toLowerCase();
      const currentNative = currentUser.nativeLanguage?.toLowerCase();
      const currentLearning = currentUser.learningLanguage?.toLowerCase();
      
      if (userNative === currentLearning && userNative && currentLearning) {
        matchType = "teaching";
      }
      if (userLearning === currentNative && userLearning && currentNative) {
        matchType = matchType === "teaching" ? "perfect" : "learning";
      }
      
      return { ...user.toObject(), matchType };
    });

    if (bestMatch === "true") {
      recommendedUsers = recommendedUsers.filter(user => user.matchType !== "none");
    }

    recommendedUsers.sort((a, b) => {
      const order = { perfect: 0, teaching: 1, learning: 2, none: 3 };
      const orderDiff = (order[a.matchType] || 3) - (order[b.matchType] || 3);
      if (orderDiff !== 0) return orderDiff;
      return (b.averageRating || 0) - (a.averageRating || 0);
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
        "fullName profilePic nativeLanguage learningLanguage averageRating totalRatings"
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
    .select("fullName profilePic nativeLanguage learningLanguage averageRating totalRatings")
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
    const myId = String(req.user._id);
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
    const recipientFriends = recipient.friends.map(f => String(f));
    if (recipientFriends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a req already exists (only pending ones)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId, status: "pending" },
        { sender: recipientId, recipient: myId, status: "pending" },
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
      "fullName profilePic nativeLanguage learningLanguage averageRating totalRatings"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic averageRating totalRatings");

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
      "fullName profilePic nativeLanguage learningLanguage averageRating totalRatings"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function rejectFriendRequest(req, res) {
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
        .json({ message: "You are not authorized to reject this request" });
    }

    // Delete the request so sender can send again
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function blockUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add to blocked list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: userId },
    });

    // Remove from friends if they are friends
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: currentUserId },
    });

    // Delete any pending friend requests
    await FriendRequest.deleteMany({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateUserRating(userId) {
  const ratings = await Rating.find({ ratedUser: userId });
  
  if (ratings.length === 0) {
    await User.findByIdAndUpdate(userId, {
      averageRating: 0,
      totalRatings: 0,
    });
    return;
  }

  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const average = total / ratings.length;

  await User.findByIdAndUpdate(userId, {
    averageRating: Math.round(average * 10) / 10,
    totalRatings: ratings.length,
  });
}

export const rateUser = async (req, res) => {
  try {
    const raterId = req.user.id;
    const { userId: ratedUserId } = req.params;
    const { rating } = req.body;

    if (raterId === ratedUserId) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const ratedUser = await User.findById(ratedUserId);
    if (!ratedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(raterId);
    if (!currentUser.friends.includes(ratedUserId)) {
      return res.status(403).json({ message: "You can only rate friends" });
    }

    const existingRating = await Rating.findOne({
      rater: raterId,
      ratedUser: ratedUserId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await Rating.create({
        rater: raterId,
        ratedUser: ratedUserId,
        rating,
      });
    }

    await updateUserRating(ratedUserId);

    const updatedUser = await User.findById(ratedUserId).select("averageRating totalRatings");

    res.status(200).json({
      message: existingRating ? "Rating updated" : "Rating submitted",
      averageRating: updatedUser.averageRating,
      totalRatings: updatedUser.totalRatings,
    });
  } catch (error) {
    console.error("Error in rateUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
