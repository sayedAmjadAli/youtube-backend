import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if ([title, description].some(item => item.trim() === "")) {
        throw new ApiError(400, "All Fields are require")
    }

    try {
        const videoLocalPath = req.files?.videoFile[0]?.path

        if (!videoLocalPath) {
            throw new ApiError(400, "video file is required")
        }

        const thumbnailLocalPath = req.files?.thumbnail[0]?.path

        if (!thumbnailLocalPath) {
            throw new ApiError(400, "thumbnail is required")
        }

        const existsVideo = await Video.findOne({ title })

        if (existsVideo) {
            throw new ApiError(403, "This video already exists")
        }

        //now upload the video on cloudinary and also thumbnail

        let videoOnCloudinary
        try {
            videoOnCloudinary = await uploadOnCloudinary(videoLocalPath)
        } catch (error) {
            throw new ApiError(400, "Error Occur while uploading video on cloundinary")
        }



        let thumbnailOnCloudinary
        try {
            thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
        } catch (error) {
            throw new ApiError(400, "Error Occur while uploading thumbnail on cloundinary")
        }

        const video = await Video.create({
            title, description, videoFile: videoOnCloudinary?.url, duration: videoOnCloudinary?.duration, thumbnail: thumbnailOnCloudinary?.url, owner: req.user._id
        })

        res.status(200).json(new ApiResponse(200, { video }, "successfully publish video"))




    } catch (error) {
        console.log(error)
        throw new ApiError(400, "Error occur while uploadin video : ", error.message)
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoId)
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

        if (!video) {
            throw new ApiError(400, "Video not found")
        }

        res.status(200).json(new ApiResponse(200, { video }, "successfully get video by id"))
    } catch (error) {
        throw new ApiError(400, "Error occur while geting video by id ", error.message)
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    try {
        const video = await Video.findOne({ _id: videoId })
        if (!video) {
            throw new ApiError(400, "video not found")
        }

        const thumbnailLocalPath = req.file?.path


        let thumbnailOnCloudinary

        if (thumbnailLocalPath) {
            thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
        }


        video.title = title || video.title
        video.description = description || description
        video.thumbnail = thumbnailOnCloudinary?.url || video.thumbnail

        await video.save()

        res.status(200).json(new ApiResponse(200, {}, "Successfully update video details"))



    } catch (error) {
        console.log(error)
        throw new ApiError(400, "Error occur while updating video : ", error.message)
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video


    try {
        const video = await Video.deleteOne({_id:videoId})
       

        res.status(200).json(new ApiResponse(200, {}, "Successfully delete video "))



    } catch (error) {
        console.log(error)
        throw new ApiError(400, "Error occur while deleting video : ", error.message)
    }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    try {
        const video = await Video.findOne({ _id: videoId })
        if (!video) {
            throw new ApiError(400, "video not found")
        }
  

        video.isPublished=!video.isPublished
        res.status(200).json(new ApiResponse(200, {}, "Successfully toggle publish video "))



    } catch (error) {
        console.log(error)
        throw new ApiError(400, "Error occur while toggling publish video : ", error.message)
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}