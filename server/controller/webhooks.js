import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose";

export const clerkWebhooks = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const reqBody = req.body;
    if (!reqBody) {
      console.log("ERROR: Missing request body");
      return res.status(400).json({ error: "Missing request body" });
    }
    const { data, type } = reqBody;
    if (!data || !type) {
      console.log("ERROR: Invalid request body");
      return res.status(400).json({ error: "Invalid request body" });
    }
    
    console.log("Webhook type:", type);
    console.log("Webhook data:", data);
    await webhook.verify(JSON.stringify(reqBody), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    switch (type) {
      case "user.created": {
        console.log("Creating user in database...");
        const userData = {
          _id: data.id,
          email: data.email_addresses[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
          resume: "",
        };
        console.log("User data to create:", userData);
        
        try {
          // Đảm bảo MongoDB connection
          if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not connected, reconnecting...");
            await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
          }

          // Idempotent handling:
          // 1) ưu tiên match theo Clerk user id (_id)
          // 2) nếu không có, fallback theo email để tránh duplicate key email
          // 3) nếu không có gì, tạo mới
          let user = await User.findById(userData._id);

          if (user) {
            user.email = userData.email;
            user.name = userData.name;
            user.image = userData.image;
            await user.save();
            console.log("User updated by clerk id:", user);
          } else {
            const userByEmail = await User.findOne({ email: userData.email });

            if (userByEmail) {
              // Giữ _id cũ để tránh vỡ reference cũ trong DB
              userByEmail.name = userData.name;
              userByEmail.image = userData.image;
              await userByEmail.save();
              user = userByEmail;
              console.log("User matched by email and updated:", user);
            } else {
              user = await User.create(userData);
              console.log("User created successfully:", user);
            }
          }

          res.json({ success: true, user });
        } catch (dbError) {
          console.error("Database error when creating/updating user:", dbError);
          res.status(500).json({ 
            success: false, 
            error: "Failed to create/update user in database",
            details: dbError.message 
          });
        }
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        res.status(400).json({ error: "Unhandled event type" });
        break;
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Webhooks Error" });
  }
};
