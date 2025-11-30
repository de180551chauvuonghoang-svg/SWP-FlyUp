import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import { query } from "../lib/postgres.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { rows } = await query("SELECT id, full_name, email, profile_pic FROM users WHERE id != $1", [loggedInUserId]);
    
    const filteredUsers = rows.map(user => ({
        _id: user.id.toString(),
        fullName: user.full_name,
        email: user.email,
        profilePic: user.profile_pic
    }));

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id.toString();

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    
    const { rows } = await query("SELECT id FROM users WHERE id = $1", [receiverId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId === loggedInUserId
            ? msg.receiverId
            : msg.senderId
        )
      ),
    ];

    if (chatPartnerIds.length === 0) {
        return res.status(200).json([]);
    }

    const placeholders = chatPartnerIds.map((_, i) => `$${i + 1}`).join(",");
    const { rows } = await query(`SELECT id, full_name, email, profile_pic FROM users WHERE id IN (${placeholders})`, chatPartnerIds);

    const chatPartners = rows.map(user => ({
        _id: user.id.toString(),
        fullName: user.full_name,
        email: user.email,
        profilePic: user.profile_pic
    }));

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) => reaction.userId === userId && reaction.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions = message.reactions.filter(
        (reaction) => reaction.userId !== userId
      );
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(message.senderId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionUpdate", message);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("reactionUpdate", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in addReaction: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};