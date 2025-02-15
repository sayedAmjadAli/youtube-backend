import {ApiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {JWT_ACCESS_TOKEN_SECRET} from "../config/env.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
const verifyJwt=asyncHandler(async(req,res,next)=>{
    const accessToken=req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken=jwt.verify(accessToken,JWT_ACCESS_TOKEN_SECRET)
        const user=await User.findOne({_id:decodedToken._id}).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid AccessToken")
        }
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error.message || "Unauthorized request")
    }

})

export {verifyJwt}