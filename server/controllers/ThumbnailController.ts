import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is initialized from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

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

// Helper: Upload image buffer directly to Cloudinary without writing to disk
const uploadBufferToCloudinary = (buffer: Buffer): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "thumblify" },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/* ---------------- GENERATE THUMBNAIL ---------------- */

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "User not logged in. Please sign in to generate thumbnails." });
    }

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Thumbnail title is required." });
    }

    /* ---------------- SAVE DRAFT TO DB ---------------- */

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      style: style || "Bold & Graphic",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: !!text_overlay,
      isGenerating: true,
    });

    /* ---------------- BUILD PROMPT ---------------- */
    const selectedStyle = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
    const selectedColor = color_scheme ? colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] : "";

    let fullPrompt = `High quality YouTube thumbnail art for topic: "${title}". `;
    if (user_prompt) {
      fullPrompt += `${user_prompt}. `;
    }
    fullPrompt += `${selectedStyle}, ${selectedColor}. Clean composition, 8k resolution, highly detailed masterpiece.`;

    let imageBuffer: Buffer | null = null;

    /* ---------------- 1. TRY HIGH-SPEED FLUX AI GENERATION ENGINE ---------------- */
    try {
      const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&model=flux&nologo=true`;
      const aiResponse = await axios.get(fluxUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 30000
      });

      if (aiResponse.status === 200 && aiResponse.data && aiResponse.data.byteLength > 1000) {
        imageBuffer = Buffer.from(aiResponse.data);
      }
    } catch (fluxErr: any) {
      console.warn("Flux primary engine notice:", fluxErr.message);
    }

    /* ---------------- 2. HUGGING FACE BACKUP FALLBACK ---------------- */
    if (!imageBuffer && process.env.HF_API_KEY) {
      try {
        const hfResponse = await axios.post(
          "https://router.huggingface.co/hf-inference/models/prompthero/openjourney",
          { inputs: fullPrompt },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
              "Accept": "image/png"
            },
            responseType: "arraybuffer",
            timeout: 30000
          }
        );
        if (hfResponse.status === 200 && hfResponse.data) {
          imageBuffer = Buffer.from(hfResponse.data);
        }
      } catch (hfErr: any) {
        console.warn("HF fallback notice:", hfErr.message);
      }
    }

    if (!imageBuffer) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
      return res.status(500).json({ message: "Failed to generate AI thumbnail image. Please try again." });
    }

    /* ---------------- 3. UPLOAD TO CLOUDINARY WITH BASE64 FALLBACK ---------------- */
    let finalImageUrl = "";

    try {
      const cloudResult = await uploadBufferToCloudinary(imageBuffer);
      finalImageUrl = cloudResult.secure_url;
    } catch (cloudErr: any) {
      console.warn("Cloudinary upload fallback to base64 data URL:", cloudErr.message);
      finalImageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    }

    /* ---------------- UPDATE DB ---------------- */

    thumbnail.image_url = finalImageUrl;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    /* ---------------- RESPONSE ---------------- */

    return res.json({
      message: "Thumbnail generated successfully",
      thumbnail,
    });

  } catch (error: any) {
    console.error("Thumbnail Error:", error.message);
    return res.status(500).json({
      message: error.message || "Thumbnail generation failed",
    });
  }
};

/* ---------------- DELETE THUMBNAIL ---------------- */

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    return res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
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

    return res.json({ 
      message: thumbnail.isPublic ? "Thumbnail is now public" : "Thumbnail is now private",
      isPublic: thumbnail.isPublic
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET COMMUNITY THUMBNAILS ---------------- */

export const getCommunityThumbnails = async (req: Request, res: Response) => {
  try {
    const thumbnails = await Thumbnail.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .limit(50);

    return res.json({ thumbnails });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};