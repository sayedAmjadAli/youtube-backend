import mongoose, { isValidObjectId } from "mongoose"
import { PlayList } from "../models/playlist.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if ([name, description].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are require")
    }
    try {
        const playlist = await PlayList.create({ name, description, owner: req.user._id, videos: [] })

        res.status(200)
            .json(new ApiResponse(200, { playlist }, "Successfully create playlist"));
    } catch (error) {

        throw new ApiError(400, "Error occur while creating playlist", error.message)
    }


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    try {
        const playlists = await PlayList.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                    }
                }
            ]
        )
        res.status(200)
            .json(new ApiResponse(200, { playlists }, "Successfully get playlist"));
    } catch (error) {
        throw new ApiError(400, "Error occur while getting all playlists", error.message)
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    try {
        const playlist = await PlayList.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos",
                    pipeline: [
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
                                            avatar: 1

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
                                avatar: 1

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
        ])
        res.status(200)
            .json(new ApiResponse(200, { playlist }, "Successfully get playlist"));
    } catch (error) {
        throw new ApiError(400, "Error occur while getting playlist  ", error.message)
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    try {
        const playlist = await PlayList.findOne({ _id: playlistId })
        if (!playlist) {
            throw new ApiError(400, "playlist not found")
        }

        playlist.videos = [...playlist.videos, videoId]
        await playlist.save()

        res.status(200)
            .json(new ApiResponse(200, {}, "Successfully added video to playlist"));
    } catch (error) {
        throw new ApiError(400, "Error occur while added video to playlist", error.message)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    try {

        const playlist = await PlayList.findOne({ _id: playlistId })

        if (!playlist) {
            throw new ApiError(400, "playlist not found")
        }


        playlist.videos = playlist.videos.filter(video => video === videoId)
        await playlist.save()

        res.status(200)
            .json(new ApiResponse(200, {}, "Successfully Removed video from playlist"));
    } catch (error) {
        throw new ApiError(400, "Error occur while removing video from playlist", error.message)
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    try {
        const removePlaylist = await PlayList.findOneAndDelete({ _id: playlistId })
       if(!removePlaylist){
        throw new ApiError(400,"playlist does not exists")
       }
        res.status(200)
            .json(new ApiResponse(200, {}, "Successfully delete playlist"));
    } catch (error) {
        throw new ApiError(400, "Error occur while deleting playlist", error.message)
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    try {
        const updatedPlaylist = await PlayList.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                    name, description
                }
            },
            {
                new: true
            }
        )
        res.status(200)
            .json(new ApiResponse(200, { updatedPlaylist }, "Successfully updated playlists"));
    } catch (error) {
        throw new ApiError(400, "Error occur while updating playlists", error.message)
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}