import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    try {
        const totalVideos=await Video.aggregate(
            [
                {
                    $match:{
                        owner:new mongoose.Types.ObjectId(req.user._id)
                    }
                }
                
            ]
        )


      

        const totalSubscribers=await Subscription.find({channel:req.user._id})
        const totalLikes=await Like.aggregate(
            [
                {
                    $lookup:{
                        from:"videos",
                        localField:"video",
                        foreignField:"_id",
                        as:"video",
                        pipeline:[
                            {
                                $match:{
                                    owner:new mongoose.Types.ObjectId(req.user._id)
                                }
                            }
                        ]


                    }
                }
            ]
        )
        res.status(200).json(new ApiResponse(200,{videoCount:totalVideos.length,likesCount:totalLikes.length,subscribers:totalSubscribers.length},"Succefully get video analytics"))
    } catch (error) {
        throw new ApiError(500,error.message)
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
   try {
    const videos=await Video.aggregate(
        [
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(req.user._id)
                }
            },

        ]
    )

    return res.status(200).json(new ApiResponse(200,{videos},"Sucessfully get all videos"))
   } catch (error) {
    return new ApiError(500,error.message)
   }
})

export {
    getChannelStats, 
    getChannelVideos
    }