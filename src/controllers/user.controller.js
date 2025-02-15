import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  deleteResourseFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const generateAccesAndRefreshToken=async(userId)=>{
    try {
      const user=await User.findOne({_id:userId})

      const accessToken=user.generateAcessToken()
      const refreshToken=user.generateRefreshToken()
    
      user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})
      return {accessToken,refreshToken}
    } catch (error) {
      throw new ApiError(400,"Error Occur while generating Tokens",error.message)
    }
}

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
    console.log(error)
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

const login =asyncHandler(async (req,res)=>{
   const {email,password}=req.body
  
   if([email,password].some(field=>field.trim()==="")){
      throw new ApiError(400,"All Fields are require")
   }

  try {
    const user=await User.findOne({email})
    console.log(user)
    if(!user){
      throw new ApiError(400,"email or password is wrong")
    }

    const checkPassword=await user.isCorrectPassword(password)

    if(!checkPassword){
      throw new ApiError(400,"email or password is wrong")
    }
  
    const {accessToken,refreshToken}=await generateAccesAndRefreshToken(user._id)
    
    const loggedUser=await User.findOne({_id:user._id}).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:false
  }

  res.
  status(200).
  cookie("accessToken",accessToken,options).
  cookie("refreshToken",refreshToken,options).
  json(new ApiResponse(
    200,
    {accessToken,refreshToken,loggedUser},
    "successfully login user"
  ))


    
  } catch (error) {
    throw new ApiError(500,"Error occur while login to user",error.message)
  }

})

const logout=asyncHandler(async(req,res)=>{
  const user=await User.findOne({_id:req.user._id})
   
  user.refreshToken=""

  const options={
    httpOnly:true,
    secure:false
  }

  res.
  status(200).
  clearCookie("accessToken",options).
  clearCookie("refreshToken",options).
  json(new ApiResponse(200,{},"logout user"))

})
export { registerUser,login ,logout};
