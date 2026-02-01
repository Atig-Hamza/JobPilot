import History from "../models/history.js";
import { generateChatTitle } from "./LLMService.js";

export const getHistoryTitleByUserId = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const history = await History.find({ userId })
        .select('title roomId createdAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await History.countDocuments({ userId });

    return {
        history,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
}

export const addHistoryEntry = async (userId, title, content) => {
    const historyEntry = new History({
        userId,
        title,
        content
    });
    return await historyEntry.save();
}

export const getHistoryByUserId = async (userId) => {
    return await History.find({ userId }).sort({ createdAt: -1 });
}

export const deleteHistoryById = async (historyId, userId) => {
    return await History.findOneAndDelete({ _id: historyId, userId });
}

export const updateHistoryEntry = async (historyId, userId, updatedContent) => {
    const historyEntry = await History.findOne({ _id: historyId, userId });
    if (!historyEntry) {
        throw new Error('History entry not found');
    }
    historyEntry.content = updatedContent;
    return await historyEntry.save();
}

export const getHistoryByRoomId = async (userId, roomId) => {
    return await History.findOne({ userId, roomId });
}

export const saveChatInteraction = async (userId, roomId, prompt, response) => {
    let historyEntry = await History.findOne({ roomId, userId });

    if (historyEntry) {
        historyEntry.content.push(`User: ${prompt}`);
        historyEntry.content.push(`AI: ${response}`);

        if (historyEntry.content.length === 4) {
            const newTitle = await generateChatTitle(roomId, historyEntry.content);
            if (newTitle) {
                historyEntry.title = newTitle;
            }
        }

        await historyEntry.save();
    } else {
        historyEntry = new History({
            userId,
            roomId,
            title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
            content: [`User: ${prompt}`, `AI: ${response}`]
        });
        await historyEntry.save();
    }
    return historyEntry;
}