import catchAsync from '../utils/catchAsync.js';
import * as waitlistService from '../services/waitlistService.js';

export const joinWaitlist = catchAsync(async (req, res, next) => {
  const result = await waitlistService.addToWaitlist(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      entry: result
    }
  });
});

export const getWaitlist = catchAsync(async (req, res, next) => {
  const list = await waitlistService.getAllWaitlist();

  res.status(200).json({
    status: 'success',
    results: list.length,
    data: {
      list
    }
  });
});

export const approveUser = catchAsync(async (req, res, next) => {
  const user = await waitlistService.approveWaitlistUser(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User approved and moved to users table successfully.',
    data: { user }
  });
});
