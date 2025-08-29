import Conversation from "../Models/conversationModels.js";
import User from "../Models/userModels.js";

export const getUserBySearch=async(req,res)=>{
try {
    const search = req.query.search || '';
    const currentUserID = req.user._conditions._id;
    const user = await User.find({
        $and:[
            {
                $or:[
                    {username:{$regex:'.*'+search+'.*',$options:'i'}},
                    {fullname:{$regex:'.*'+search+'.*',$options:'i'}}
                ]
            },{
                _id:{$ne:currentUserID}
            }
        ]
    }).select("-password").select("email")

    res.status(200).send(user)

} catch (error) {
    res.status(500).send({
        success: false,
        message: error
    })
    console.log(error);
}
}


export const getCorrentChatters = async (req, res) => {
  try {
    const currentUserID = req.user._conditions._id;

    const currenTChatters = await Conversation.find({
      participants: currentUserID
    }).sort({ updatedAt: -1 });

    if (!currenTChatters || currenTChatters.length === 0) {
      return res.status(200).send([]);
    }

    // हर conversation से दूसरा user निकालना
    const partcipantsIDS = currenTChatters.reduce((ids, conversation) => {
      const otherParticipents = conversation.participants.filter(
        id => id.toString() !== currentUserID.toString()
      );
      return [...ids, ...otherParticipents];
    }, []);

    // unique ids निकालने के लिए
    const otherParticipentsIDS = [...new Set(partcipantsIDS)];

    // user details fetch करना
    const users = await User.find({
      _id: { $in: otherParticipentsIDS }
    })
      .select("-password")
      .select("-email");

    // अब हर user के साथ उसका unread count भी भेजेंगे
    const usersWithUnread = otherParticipentsIDS.map(id => {
      const user = users.find(u => u._id.toString() === id.toString());
      const convo = currenTChatters.find(c =>
        c.participants.some(p => p.toString() === id.toString())
      );

      return {
        ...user.toObject(),
        unreadCount: convo?.unreadCount?.get(currentUserID.toString()) || 0
      };
    });

    res.status(200).send(usersWithUnread);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
