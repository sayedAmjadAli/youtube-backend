import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_ACCESS_TOKEN_EXPIRE_IN, JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_EXPIRE_IN, JWT_REFRESH_TOKEN_SECRET } from "../config/env.js";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  avatar: {
    type: String,
    required:true
  },
  coverImage: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  watchHistory: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
});

userSchema.pre("save", async function(next)  {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRE_IN }
  );
};

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
      {
        _id: this._id,
      },
      JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: JWT_REFRESH_TOKEN_EXPIRE_IN }
    );
  };

export const User = mongoose.model("User", userSchema);
