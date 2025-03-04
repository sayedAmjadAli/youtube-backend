import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const existsLikeVideo = await Like.findOne(
            {
                $and: [
                    {
                        video: videoId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })
        if (!existsLikeVideo) {
            const likeVideo = await Like.create({ video: videoId, likedBy: req.user._id })
            return res.status(200)
                .json(new ApiResponse(200, { likeVideo }, "Successfully like video"));
        }

        const dislikeTweet = await Like.deleteOne(
            {
                $and: [
                    {
                        video: videoId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })



        return res.status(200)
            .json(new ApiResponse(200, {}, "Successfully Dislike video"));
    } catch (error) {
        throw new ApiError(400, "Error occur while toggle like video", error.message)
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    try {
        const existsLikeComment = await Like.findOne(
            {
                $and: [
                    {
                        comment: commentId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })
        if (!existsLikeComment) {
            const likeComment = await Like.create({ comment: commentId, likedBy: req.user._id })
            return res.status(200)
                .json(new ApiResponse(200, { likeComment }, "Successfully like comment"));
        }

        const disLikeTweet = await Like.deleteOne(
            {
                $and: [
                    {
                        comment: commentId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })



        return res.status(200)
            .json(new ApiResponse(200, {}, "Successfully dislike comment"));
    } catch (error) {
        throw new ApiError(400, "Error occur while toggle like comment", error.message)
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    try {
        const existsLikeTweet = await Like.findOne(
            {
                $and: [
                    {
                        tweet: tweetId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })
        if (!existsLikeTweet) {
            const likeTweet = await Like.create({ tweet: tweetId, likedBy: req.user._id })
            return res.status(200)
                .json(new ApiResponse(200, { likeTweet }, "Successfully like tweet"));
        }

        const dislikeTweet = await Like.deleteOne(
            {
                $and: [
                    {
                        tweet: tweetId
                    },
                    {
                        likedBy: req.user._id
                    }
                ]
            })



        return res.status(200)
            .json(new ApiResponse(200, {}, "Successfully dislike tweet"));
    } catch (error) {
        throw new ApiError(400, "Error occur while toggle like tweet", error.message)
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    try {

     const likedVideos=await Like.aggregate(
        [
            {
                $match:{
                    likedBy:new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"videos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            _id:1,
                                            username:1,
                                            fullname:1
                                        }
                                    }
                                ]
                            }    
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    video:{
                        $first:"$videos"
                    }
                }
            },
            {
                $project:{
                    _id:1,
                    video:1,
                    likedBy:1
                }
            }
        ]
     )

        return res.status(200)
            .json(new ApiResponse(200, {likedVideos}, "Successfully get liked videos"));
    } catch (error) {
        throw new ApiError(400, "Error occur while getting liked videos", error.message)
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}