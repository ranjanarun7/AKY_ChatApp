const Message = require("../Models/messageSchema");
const Conversation = require("../Models/conversationModels");
const {getReceiverSocketId,io} = require("../Socket/socket");

const sendMessage=async(req,res)=>{
 const {id:receiverId}=req.params;
 const {message}=req.body;
 const senderId=req.user._id;
 try {
  let chats=await Conversation.findOne({
   participants: {$all: [senderId, receiverId]}
  });
  if(!chats) {
   chats=await Conversation.create({
    participants: [senderId, receiverId]
   });
  }
  const newMessage=await Message.create({
   senderId,
   receiverId,
   message,
   conversationId:chats._id
  });
  if(newMessage){
    chats.messages.push(newMessage._id);
  }
  await Promise.all([chats.save(), newMessage.save()]);
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", newMessage);
  }
  res.status(201).json(newMessage);
 } catch (error) {
  res.status(500).json({error:error.message});
 }
};

const getMessages=async(req,res)=>{
 const {id:receiverId}=req.params;
 const senderId=req.user._id;
 try {
  const chats=await Conversation.findOne({
   participants: {$all: [senderId, receiverId]}
  }).populate('messages');
  res.status(200).json(chats.messages);
 } catch (error) {
  res.status(500).json({error:error.message});
 }
};

module.exports={sendMessage,getMessages};
