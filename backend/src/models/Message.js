import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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