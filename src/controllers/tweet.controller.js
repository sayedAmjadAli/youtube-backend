import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (content.trim() === "") {
        throw new ApiError(400, "All fields are require")
    }
    try {
        const tweet = await Tweet.create({ content, owner: req.user._id })
        res
            .status(200)
            .json(new ApiResponse(200, { tweet }, "Successfully created tweet"));
    } catch (error) {
        throw new ApiError(400, "Error occur while creating tweet", error.message)
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    try {


        const tweets = await Tweet.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    username: 1,
                                    fullname: 1,
                                    avatar: 1,

                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }
            ]
        )


        res.status(200)
            .json(new ApiResponse(200, { tweets }, "Successfully get all tweets by userid"));
    } catch (error) {
        throw new ApiError(400, "Error occur while getting all  tweets", error.message)
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    try {
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId, {
            $set: {
                content
            }
        },
            {
                new: true
            })

        res.status(200)
            .json(new ApiResponse(200, { updatedTweet }, "Successfully update tweet "));
    } catch (error) {
        throw new ApiError(400, "Error occur while updating tweet", error.message)
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    try {
        const updatedTweet = await Tweet.deleteOne({_id:tweetId})
            
           
            
        res.status(200)
            .json(new ApiResponse(200, {  }, "Successfully delete tweet "));
    } catch (error) {
        throw new ApiError(400, "Error occur while deleting tweet", error.message)
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}