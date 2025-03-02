import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
   try {
    const aggregate=Comment.aggregate(
        [
            {
                $match:{
                    video:new mongoose.Types.ObjectId(videoId)
                }
            },
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
                            avatar:1,
                            username:1,
                            fullname:1
                        }
                    }
                ]
            },
            },
            {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            }
        ]
    )
    const options={page,limit}
    const comments=await Comment.aggregatePaginate(aggregate,options)
    res.status(200).json(new ApiResponse(200, {comments }, "Successfully get all comments of videos"))

} catch (error) {
    throw new ApiError(400, "Error occur while getting videos comments ", error.message)
}
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (content === "") {
        throw new ApiError(400, "All Fields are require")
    }

    try {
        const comment = await Comment.create({ content, owner: req.user._id, video: videoId })

        res.status(200).json(new ApiResponse(200, { comment }, "Successfully create comment"))

    } catch (error) {
        throw new ApiError(400, "Error occur while creating comment ", error.message)
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId}=req.params
    const {content}=req.body

    if(content===""){
        throw new ApiError(400,"Provide content to update comment")
    }

    try {
        const findComment=await Comment.findOne({_id:commentId,owner:req.user._id})
        
        if(!findComment){
            throw new ApiError(400,"Comment Not Found Or You are not owner of the comment")
        }

      findComment.content=content || findComment.content

      await findComment.save()
    
    res.status(200).json(new ApiResponse(200, {  }, "Comment updated Successfully"))

    } catch (error) {
        throw new ApiError(400, "Error occur while updating comment", error.message)
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId}=req.params
 
    
    try {
        const deleteComment=await Comment.findOneAndDelete({_id:commentId,owner:req.user._id})
        
        if(!deleteComment){
            throw new ApiError(400,"You are trying to delete comment that may not your or you provide invalid id")
        }

      
    res.status(200).json(new ApiResponse(200, {  }, "Comment deleted Successfully"))

    } catch (error) {
        throw new ApiError(400, "Error occur while deleting comment", error.message)
    }

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}