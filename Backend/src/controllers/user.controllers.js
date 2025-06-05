import mongoose from "mongoose";
import { User } from "..user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../models/ApiError.js"
import { ApiResponse } from "../models/ApiResponse.js"
import { useReducer } from "react";
import { log } from "console";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = User.generateAccessToken();
        const refreshToken = User.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and Access Token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone_number, password } = req.body;
    if (
        [name, email, phone_number, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!");
    }
    const existedUser = await User.findOne({
        $or: [{ email }, { phone_number }]
    })
    if (existedUser) {
        throw new ApiError(400, "User with name,email or phone_number already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file failed to upload");
    }
    const user = await User.create(
        {
            name,
            email,
            phone_number,
            password,
            avatar: avatar.url
        }
    )
    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Failed to register User");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully!")
    )
}

)
const loginUser = asyncHandler(async (req, res) => {
    const { email, phone_number, password } = req.body;
    if (!email && !password) {
        throw new ApiError(400, "Email and Password are required");
    }
    const user = await User.findOne({
        $or: [{ email }, { phone_number }]
    })
    if (!user) {
        throw new ApiError(400, "User not found with this email or phone_number");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials");
    }
    const { accessToken, refreshToken } = await user.generateAccessAndRefreshTokens();
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!loggedInUser) {
        throw new ApiError(500, "Failed to login User");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully!"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged Out")
        )
})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }
    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
        const {accessToken,newRefreshToken} = User.generateAccessAndRefreshTokens(user._id);
        const options ={
            httpOnly: true,
            secure: true,
        }
        return res.
        status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    }catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh Token");
    }
})
const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Old Password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave : false});
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateUserDetails= asyncHandler(async (req,res)=>{
    const {name, email,phone_number} = req.body;
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                name,
                email,
                phone_number
            }
        },
        {
            new : true
        }
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"User details Updated Successfully")
    );
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarPath = req.file?.avatar;
    if(!avatarPath){
        throw new ApiError(400,"Avatar is required");
    }
    const user = await User.findbyId(req.user?._id).select("avatar");
    if(user?.avatar){
        const avatarPublicId = user.avatar.split("/").pop().split(".")[0];
        console.log(avatarPublicId)
        await cloudinary.uploader.destroy(avatarPublicId);
    }
    const avatar = uploadOnCloudinary(avatarPath);
    if(!avatar.url){
        throw new ApiError(400,"Avatar upload failed");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },{
            new : true
        }
    ).select("-password");
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedUser,"User avatar updated successfully")
    );
                
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
}