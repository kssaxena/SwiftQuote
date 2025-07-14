import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UploadImages } from "../utils/imageKit.io.js";
import { raw } from "express";
import axios from "axios";
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";
import { Template } from "../models/template.models.js";

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
  const {
    name,
    contact,
    email,
    password,
    businessName,
    businessAddress,
    businessContact,
    gstNumber,
    // image,
  } = req.body;

  // Debug log (optional)
  // console.log("Registering:", {
  //   name,
  //   contact,
  //   email,
  //   password,
  //   businessName,
  //   businessAddress,
  //   businessContact,
  //   gstNumber,
  // });

  // Validate required fields
  if (
    !name ||
    !contact ||
    !email ||
    !password ||
    !businessName ||
    !businessAddress ||
    !businessContact ||
    !gstNumber
    // !image
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  if (contact.length !== 10 || businessContact.length !== 10) {
    throw new ApiError(400, "Contact numbers must be 10 digits long");
  }

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ contact }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with same contact, email already exists");
  }

  const imageFile = req.file;
  if (!imageFile) throw new ApiError(404, "Image file not found!");
  const images = await UploadImages(
    imageFile.filename,
    {
      folderStructure: `all-user/${businessName.split(" ").join("-")}/logo_`,
    },
    [`${businessName.split(" ").join("-")}-logo_`, `${gstNumber}`]
  );
  console.log(images);

  if (!images)
    throw new ApiError(
      500,
      "Failed to upload image due to internal error! Please try again"
    );

  // Create new user
  const user = await User.create({
    name,
    contact,
    email,
    password,
    businessName,
    businessAddress,
    businessContact,
    gstNumber,
    image: {
      url: images.url,
      fileId: images.fileId,
      altText: name,
    },
  });

  // Generate tokens
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Send response
  res
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

const createTemplate = asyncHandler(async (req, res) => {
  const { userId, templateName } = req.body;

  // Required field check
  if (!userId || !templateName || !req.body.fields) {
    throw new ApiError(400, "Please provide userId, templateName, and fields");
  }

  let fields;
  try {
    fields = JSON.parse(req.body.fields); // fields sent as stringified JSON from FormData
  } catch (error) {
    throw new ApiError(400, "Invalid fields format. Must be JSON");
  }

  // Validate fields array
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new ApiError(400, "Fields must be a non-empty array");
  }

  // Optionally validate each field
  for (const field of fields) {
    if (!field.label || !field.key || !field.type) {
      throw new ApiError(400, "Each field must include label, key, and type");
    }
  }

  // Optional logo upload handling (if using req.file)
  let logoUrl = "";
  if (req.file) {
    // Assuming you’ve already uploaded to Cloudinary/S3 and set req.file.url
    logoUrl = req.file.url || "";
  }

  // Create template
  const template = await Template.create({
    userId,
    templateName,
    fields,
    logoUrl,
  });

  res
    .status(201)
    .json(new ApiResponse(201, template, "Template created successfully"));
});

const generateInvoice = asyncHandler(async (req, res) => {
  const { userId, templateId } = req.params;
  const { formData } = req.body;

  // Validate required fields
  if (!userId || !templateId || !formData || typeof formData !== "object") {
    throw new ApiError(400, "Missing required fields for invoice generation");
  }

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch template
  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  // Generate the invoice PDF
  const pdfBuffer = await generateInvoicePDF({ user, template, formData });

  if (!pdfBuffer || !pdfBuffer.length) {
    throw new ApiError(500, "PDF generation failed");
  }

  // Send PDF in response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

  res.status(200).send(pdfBuffer);
});

export {
  registerUser,
  loginUser,
  LogOutUser,
  regenerateRefreshToken,
  RawImageUpload,
  generateInvoice,
};
