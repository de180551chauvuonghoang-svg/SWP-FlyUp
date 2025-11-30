import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        trim: true,
        maxlength: 300,
        required: true,
    },
    image: {
        type: String,
    },
    reactions: [{
        userId: {
            type: String,
            required: true,
        },
        emoji: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, {
    timestamps: true,
});

const Message = mongoose.model("Message", messageSchema);
export default Message;