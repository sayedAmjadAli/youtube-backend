import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    // i will return this check varibale to frontend developer if it is true that means successfully subscribe to that channel if false means successfully unsubscibe to that channel

    const existsSubscribeTo = await Subscription.findOne({
      $and: [{ subscriber: req.user._id }, { channel: channelId }],
    });

    if (!existsSubscribeTo) {
      const subscribeToChannel = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "successfully subscribe to channel"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, {}, "successfully unsubscribe to channel"));
  } catch (error) {
    throw new ApiError(400, "Error Occur while toggle to subscribe");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  
  try {
    const subscriberList = await Subscription.aggregate([
      { $match: { channel:new  mongoose.Types.ObjectId(channelId) } },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                email: 1,
                coverImage: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, subscriberList,"successfully get subscriber list"));
  } catch (error) {
    throw new ApiError(400,"Error Occur while fething subscriber List")
  }

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
 
  
  try {
    const channelList = await Subscription.aggregate([
      { $match: { subscriber:new  mongoose.Types.ObjectId(subscriberId) } },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                email: 1,
                coverImage: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, channelList,"successfully get subscribed list"));
  } catch (error) {
    throw new ApiError(400,"Error Occur while fething subscribed List")
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
