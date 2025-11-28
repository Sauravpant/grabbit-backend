import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ProductData } from "../types/types";
import { io } from "../app";

export const postProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, quantity, urgency } =
      req.body as ProductData;
    if (!name || !description || !category || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const buffer = req.file?.buffer;
    const fileName = req.file?.originalname;
    let image = null;
    if (req.file && buffer && fileName) {
      image = await uploadToCloudinary(buffer, fileName);
      if (!image) {
      return res.status(500).json({ success: false, message: "Image upload failed" });
    }
    }
    const product = {
      name,
      description,
      category,
      quantity,
      urgency: urgency || "normal",
      imageUrl: image?.secure_url || null,
    };
    //For now the product is not being saved to any database and simpled broadcasted via socket.io typically it would be saved to a database here
    io.to(category).emit("new-product", {
      message: "New product posted",
      product,
    });

    return res.status(201).json({ success: true, message: "Product posted successfully", product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
