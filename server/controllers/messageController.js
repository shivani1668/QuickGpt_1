import Chat from '../models/Chat.js';
import User from '../models/user.js';
import axios from 'axios';
import OpenAI from 'openai';
import ImageKit from 'imagekit';

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, prompt } = req.body;

        if (req.user.credits < 1) {
            return res.json({ success: false, message: "Not enough credits" });
        }

        const chat = await Chat.findOne({ userId, _id: chatId });
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
        res.json({ success: true, reply });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        if (req.user.credits < 1) {
            return res.json({ success: false, message: "Not enough credits" });
        }

        const { prompt, chatId, isPublished } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });

        const encodedPrompt = encodeURIComponent(prompt);
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" });

        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt",
            isPrivateFile: false,
        });

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished,
        };

        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
        res.json({ success: true, reply });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
