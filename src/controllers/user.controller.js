import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  deleteResourseFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  JWT_REFRESH_TOKEN_SECRET,
} from "../config/env.js";
import mongoose from "mongoose";

const generateAccesAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });

    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "Error Occur while generating Tokens",
      error.message
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are require");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) {
    throw new ApiError(400, "This user already exists");
  }

  let cloudAvatar;
  try {
    cloudAvatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(500, "faild to upload avatar");
  }
  let cloudCoverImage;
  try {
    cloudCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  } catch (error) {
    throw new ApiError(500, "failed to upload coverImage");
  }

  try {
    const registerUser = await User.create({
      username,
      fullname,
      email,
      password,
      coverImage: cloudCoverImage.url || "",
      avatar: cloudAvatar?.url,
    });

    const user = await User.findOne({ _id: registerUser._id }).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(500, "Error Occur while creating User");
    }
    res
      .status(201)
      .json(new ApiResponse(201, user, "Successfully created user"));
  } catch (error) {
    console.log(error);
    if (cloudAvatar) {
      await deleteResourseFromCloudinary(cloudAvatar.public_id);
    }
    if (cloudCoverImage) {
      await deleteResourseFromCloudinary(cloudCoverImage.public_id);
    }

    throw new ApiError(
      500,
      "something went wrong while registering user and images were deleted "
    );
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All Fields are require");
  }

  try {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new ApiError(400, "email or password is wrong");
    }

    const checkPassword = await user.isCorrectPassword(password);

    if (!checkPassword) {
      throw new ApiError(400, "email or password is wrong");
    }

    const { accessToken, refreshToken } = await generateAccesAndRefreshToken(
      user._id
    );

    const loggedUser = await User.findOne({ _id: user._id }).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: false,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken, loggedUser },
          "successfully login user"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error occur while login to user", error.message);
  }
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  user.refreshToken = "";

  const options = {
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logout user"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookie.refreshToken || req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthrozied request");
  }

  try {
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);

    const user = await User.findOne({ _id: decodedToken._id });
    if (!user) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    if (refreshToken !== user.refreshToken) {
      throw new ApiError(401, "Expired Token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccesAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: false,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "successfully refresh accesstoken"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Error occur while refreshing accessToken",
      error.message
    );
  }
});

const getUserChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const channel = await User.aggregate([
    {
      $match: {
        username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "channelSubscriber",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$channelSubscriber",
        },
        subscriberToCount: {
          $size: "$subscribeTo",
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        username: 1,
        coverImage: 1,
        avatar: 1,
        subscriberCount: 1,
        subscriberToCount: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "User Channel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, channel, "get user channel profile"));
});

const watchHistory = asyncHandler(async (req, res) => {
  const history = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
                    fullname: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, history, "get user watchHistory"));
});

const getCurrentUser=asyncHandler(async (req,res)=>{
  return res.status(200).json(new ApiResponse(200,{currentUser:req.user},"get current user "))
})

const updateUserDetails=asyncHandler(async (req,res)=>{
  const {email,fullname}=req.body

  const updatedUser=await User.findOneAndUpdate(
    req.user._id,
    {
      $set:{
        email,
        fullname
      }
    },

    {
    returnDocument:"after"  
    }
    )

    res.status(200).json(new ApiResponse(200,updatedUser,"Successfully update user details"))
})

const changeCurrentUserPassword=asyncHandler(async(req,res)=>{
     const {currentPassword,newPassword}=req.body

     const user=await User.findOne({_id:req.user._id})
     
     const checkPassword=await user.isCorrectPassword(currentPassword)

     if(!checkPassword){
      throw new ApiError(400,"incorrect password")
     }
     user.password=newPassword
     user.save()

     res.status(200).json(new ApiResponse(200,{},"Successfully update user password"))
})

const updateAvatar=asyncHandler(async(req,res)=>{
  const localPath=req.file?.path
  if(!localPath){
    throw new ApiError(400,"avatar is required")
  }
  let cloudinaryAvatar;
   
  try {
    cloudinaryAvatar=await uploadOnCloudinary(localPath)
  } catch (error) {
    throw new ApiError(400,"Error occur while uploading avatar",error.message)
  }
  
  const updatedUser=await User.findOneAndUpdate(
    req.user._id,
    {
      $set:{
        avatar:cloudinaryAvatar.url
      }
    },
    {
    returnDocument:"after"  
    }
    ) 

    res.status(200).json(new ApiResponse(200,updatedUser,"Successfully update avatar"))

  
})

const updateCoverImage=asyncHandler(async(req,res)=>{
  const localPath=req.file?.path
  if(!localPath){
    throw new ApiError(400,"coverImage is required")
  }
  let cloudinaryCoverImage;
   
  try {
    cloudinaryCoverImage=await uploadOnCloudinary(localPath)
  } catch (error) {
    throw new ApiError(400,"Error occur while uploading coverImage",error.message)
  }
  
  const updatedUser=await User.findOneAndUpdate(
    req.user._id,
    {
      $set:{
        coverImage:cloudinaryCoverImage?.url
      }
    },
    {
    returnDocument:"after"  
    }
    ) 

    res.status(200).json(new ApiResponse(200,updatedUser,"Successfully update coverImage"))

  
})

export {
  registerUser,
  login,
  logout,
  refreshAccessToken,
  getUserChannel,
  watchHistory,
  getCurrentUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
  changeCurrentUserPassword
};
