const Conversation = require("../Models/conversationModels");
const User = require("../Models/userModels");
const getUserBySearch = async (req, res) => {
  try {
    const search = req.query.search || "";
    const currentUserId = req.user._conditions._id;
    const user = await User.find({
      $and: [
        { $or: [
          { username: { $regex:'.*' + search + '.*', $options: "i" } },
          { fullname: { $regex:'.*' + search + '.*', $options: "i" } }
        ]},
        { _id: { $ne: currentUserId } }
      ]
    }).select("-password").select("-email");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentChatters = async (req, res) => {
  try {
    const currentUserId = req.user._conditions._id;
    const currentChatters = await Conversation.find({
      participants: currentUserId
    }).sort({
      updatedAt: -1
    });
    if(!currentChatters || currentChatters.length === 0) {
      return res.status(200).json([]);
    }
    const participantsIDS=currentChatters.reduce((ids,Conversation) => {
      const otherParticipants = Conversation.participants.filter(id =>id!==currentUserId);
      return [...ids, ...otherParticipants];
    });
    const otherParticipantsIDS=participantsIDS.filter(id => id.toString() !== currentUserId.toString());
    const user=await User.find({
      _id: { $in: otherParticipantsIDS }
    }).select("-password").select("-email");
    const users=otherParticipantsIDS.map(id => user.find(user => user._id.toString() === id.toString()));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getUserBySearch, getCurrentChatters };
