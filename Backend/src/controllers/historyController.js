import { getHistoryTitleByUserId, deleteHistoryById, getHistoryByRoomId } from "../services/historyService.js";
import catchAsync from "../utils/catchAsync.js";

export const getHistoryByRoom = catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const history = await getHistoryByRoomId(req.user._id, roomId);
    
    if (!history) {
        return res.status(404).json({
            status: 'fail',
            message: 'History not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: history
    });
});

export const getHistoryTitles = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await getHistoryTitleByUserId(req.user._id, page, limit);
    
    res.status(200).json({
        status: 'success',
        data: result
    });
});

export const deleteHistory = catchAsync(async (req, res) => {
    const { id } = req.params;
    await deleteHistoryById(id, req.user._id);
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});
