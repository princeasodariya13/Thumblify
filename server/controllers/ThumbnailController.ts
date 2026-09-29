import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

/* ---------------- STYLE PROMPTS ---------------- */

const stylePrompts = {
  "Bold & Graphic":
    "bold and graphic YouTube thumbnail style, hyper-expressive emotions, dramatic studio rim lighting, extremely high contrast, crisp vector-like edges, vibrant maximalist composition, clickbait aesthetic, thick outlines, vivid and intense rendering",

  "Tech/Futuristic":
    "high-tech futuristic aesthetic, cyberpunk atmosphere, glowing neon circuit accents, holographic HUD UI elements, sleek metallic textures, cinematic sci-fi lighting, 3D rendered, intricate digital details, dark background with bright glowing accents",

  "Minimalist":
    "sleek minimalist composition, lots of negative space, clean flat design elements, soft diffused studio lighting, modern elegant aesthetic, clutter-free layout, highly readable, matte textures, sophisticated simplicity",

  "Photorealistic":
    "ultra-photorealistic quality, shot on 35mm lens, f/1.8 aperture, shallow depth of field with creamy bokeh background, crisp sharp focus on the main subject, highly detailed 8k photography, natural volumetric lighting, cinematic color grading",

  "Illustrated":
    "premium digital illustration, vibrant 2D vector graphic style, cell-shaded, dynamic character posing, expressive pop-art influences, clean flat shading, colorful and eye-catching comic book or modern animation aesthetic",
};

/* ---------------- COLOR SCHEMES ---------------- */

const colorSchemeDescriptions = {
  vibrant: "highly saturated, punchy vivid hues, intense complementary color contrast, eye-popping brightness",
  sunset: "cinematic golden hour lighting with rich orange, warm glowing yellow, and deep purple gradients, epic sky tones",
  forest: "lush earthy tones, deep moss green, warm wood browns, soft sunlight filtering through canopy, organic natural vibe",
  neon: "intense cyberpunk neon lights, electric cyan blues, hot magenta pinks, dark contrasting shadows",
  purple: "rich royal purple, moody violet tones, soft lilac highlights, mysterious and premium modern ambiance",
  monochrome: "pure black and white, dramatic chiaroscuro lighting, intense shadows, timeless high-contrast grayscale art",
  ocean: "refreshing aquatic vibes, deep navy blue, bright cyan, seafoam green, crystal clear underwater vibes",
  pastel: "soft muted pastel tones, light baby blue, pale pink, mint green, dreamy and calm washed-out aesthetic",
};

/* ---------------- GENERATE THUMBNAIL ---------------- */

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    // ⚠️ FIX: if not logged in
    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    /* ---------------- SAVE TO DB ---------------- */

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    /* ---------------- BUILD PROMPT ---------------- */
    const selectedStyle = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
    const selectedColor = color_scheme ? colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] : "";

    let prompt = `High quality YouTube thumbnail art for the topic: "${title}". `;
    
    if (user_prompt) {
      prompt += `${user_prompt}. `;
    }

    prompt += `${selectedStyle}, ${selectedColor}. `;
    prompt += `Clean composition, ample negative space for text overlays, masterpiece, 8k resolution, highly detailed.`;

    /* ---------------- HUGGING FACE API CALL ---------------- */

    const hfResponse = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/png"
        },
        responseType: "arraybuffer",
      }
    );

    /* ---------------- HANDLE HF ERRORS ---------------- */

    if (hfResponse.headers["content-type"]?.includes("application/json")) {
      const errorText = Buffer.from(hfResponse.data).toString("utf-8");
      throw new Error(errorText);
    }

    /* ---------------- CONVERT IMAGE BUFFER ---------------- */

    const finalBuffer = Buffer.from(hfResponse.data);

    /* ---------------- SAVE FILE LOCALLY ---------------- */

    const filename = `thumbnail-${Date.now()}.png`;
    const filePath = path.join("images", filename);

    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(filePath, finalBuffer);

    /* ---------------- UPLOAD TO CLOUDINARY ---------------- */

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });

    /* ---------------- UPDATE DB ---------------- */

    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    // Keep it private by default unless otherwise specified, but schema defaults to false.
    await thumbnail.save();

    /* ---------------- DELETE LOCAL FILE ---------------- */

    fs.unlinkSync(filePath);

    /* ---------------- RESPONSE ---------------- */

    res.json({
      message: "Thumbnail generated successfully",
      thumbnail,
    });
  } catch (error: any) {
    console.error("Thumbnail Error:", error.message);
    if (error.response && error.response.data) {
      try {
        const errorData = Buffer.from(error.response.data).toString('utf-8');
        console.error("HF API Error:", errorData);
      } catch (e) {
        console.error("HF API Error data buffer parse failed.");
      }
    }

    res.status(500).json({
      message: error.message || "Thumbnail generation failed",
    });
  }
};

/* ---------------- DELETE THUMBNAIL ---------------- */

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- TOGGLE PUBLIC STATUS ---------------- */

export const togglePublicStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const thumbnail = await Thumbnail.findOne({ _id: id, userId });
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    thumbnail.isPublic = !thumbnail.isPublic;
    await thumbnail.save();

    res.json({ 
      message: thumbnail.isPublic ? "Thumbnail is now public" : "Thumbnail is now private",
      isPublic: thumbnail.isPublic
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET COMMUNITY THUMBNAILS ---------------- */

export const getCommunityThumbnails = async (req: Request, res: Response) => {
  try {
    // Fetch all thumbnails that are public, highest rated or newest first
    const thumbnails = await Thumbnail.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name') // Assuming User model has a name field to show who made it
      .limit(50);

    res.json({ thumbnails });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};