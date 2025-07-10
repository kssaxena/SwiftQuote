import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UploadImages } from "../utils/imageKit.io.js";
import { raw } from "express";
import axios from "axios";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();

    return { AccessToken, RefreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, number, password } = req.body;
  console.log(name, number, password);

  if (!name || !number || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }
  if (number.length !== 10) {
    throw new ApiError(400, "Number must be 10 digits long");
  }
  const existingUser = await User.findOne({ number });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }
  const user = await User.create({ name, number, password });
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  res
    .status(201)
    .cookie("RefreshToken", RefreshToken)
    .cookie("AccessToken", AccessToken)
    .json(
      new ApiResponse(
        201,
        {
          user: user,
          tokens: {
            AccessToken,
            RefreshToken,
          },
        },
        "User registration completed successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { number, password } = req.body;
  console.log(number, password);

  if (!number || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }
  if (number.length !== 10) {
    throw new ApiError(
      400,
      "Incorrect credentials, contact number must be 10 digits"
    );
  }
  const user = await User.findOne({ number });

  if (!user) throw new ApiError(404, "Invalid contact number");

  const isValid = await user.isPasswordCorrect(password);

  if (!isValid) throw new ApiError(401, "Entered Credential is not correct");

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshTokens(
    user?._id
  );
  return res
    .status(201)
    .cookie("RefreshToken", RefreshToken)
    .cookie("AccessToken", AccessToken)
    .json(
      new ApiResponse(
        201,
        {
          user,
          tokens: {
            AccessToken,
            RefreshToken,
          },
        },
        "You are Logged In successfully"
      )
    );
});

const LogOutUser = asyncHandler(async (req, res) => {
  const LoggedOutUser = await User.findOneAndUpdate(req.user._id, {
    $set: {
      refreshToken: "1",
    },
  });

  return res.status(200).clearCookie("AccessToken").clearCookie("RefreshToken");
});

const regenerateRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.RefreshToken || req.body.RefreshToken;

  if (!token) throw new ApiError(401, "Unauthorized request");

  const DecodedToken = Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(DecodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(400, "Invalid Token");

  const { RefreshToken, AccessToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(201)
    .cookie("RefreshToken", RefreshToken)
    .cookie("AccessToken", AccessToken)
    .json(
      new ApiResponse(
        201,
        {
          user,
          tokens: {
            AccessToken,
            RefreshToken,
          },
        },
        "Refresh token regenerated successfully"
      )
    );
});

const RawImageUpload = asyncHandler(async (req, res) => {
  const ImageFile = req.file;

  if (!ImageFile) {
    throw new ApiError(400, "Please provide an image file");
  }

  const user = await User.findById(req.user._id);
  console.log(user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const UploadedImage = await UploadImages(ImageFile.filename, {
    folderStructure: `users/${req.user.name.split(" ").join("-")}/raw-images`,
  });
  user.images.push({
    raw: {
      url: UploadedImage.url,
      fileId: UploadedImage.fileId,
    },
    // output: {
    //   measurement: Model_Response.data,
    // },
  });
  await user.save();

  const Model_Response = await axios.post(
    `${process.env.MEASUREMENT_SERVICE_URL}/api/v1/users/image-analysis`,
    {
      userId: user._id,
      imageUrl: UploadedImage.url,
      fileId: UploadedImage.fileId,
    }
  );
  // user.images.push({
  //   output: {
  //     measurement: Model_Response.data,
  //   },
  // });
  const lastImageIndex = user.images.length - 1;
  user.images[lastImageIndex].output.measurement = Model_Response.data;
  await user.save();
  console.log(Model_Response.data);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        message: "Images added successfully",
        data: user.images[lastImageIndex],
      },
      "Image added successfully for measurement"
    )
  );
});

export {
  registerUser,
  loginUser,
  LogOutUser,
  regenerateRefreshToken,
  RawImageUpload,
};
