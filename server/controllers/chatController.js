import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
    try {
        const userId = req.user._id;

        const chatData = {
            userId,
            userName: req.user.name,
            messages: [],
            name: "New Chat"
        };
        await Chat.create(chatData);
        res.json({ success: true, message: "Chat created" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
        return res.json({ success: true, chats });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.body;

        await Chat.deleteOne({ _id: chatId, userId });

        res.json({ success: true, message: "Chat deleted" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
