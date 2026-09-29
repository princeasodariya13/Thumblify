import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is initialized from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

/* ---------------- STYLE PROMPTS ---------------- */

const stylePrompts: Record<string, string> = {
  "Bold & Graphic":
    "dramatic studio lighting, bold vibrant colors, high contrast, powerful emotional expression, dynamic angle, sharp focus, striking visual impact, professional photography",

  "Tech/Futuristic":
    "futuristic sci-fi, glowing cyan holographic elements, dark background, neon light accents, high-tech digital overlays, cinematic sci-fi lighting, cyberpunk aesthetic",

  "Minimalist":
    "clean minimalist layout, soft studio lighting, dark negative space, single focused subject, premium modern design, refined and sophisticated",

  "Photorealistic":
    "hyperrealistic photo, Canon EOS R5, 50mm lens, f/2.0 aperture, shallow depth of field, soft bokeh, natural light, sharp subject focus, editorial quality",

  "Illustrated":
    "vibrant digital illustration, bold flat design, clean vector style, pop-art color palette, cel-shading, sharp line art, modern graphic style",
};

/* ---------------- COLOR SCHEMES ---------------- */

const colorSchemeDescriptions: Record<string, string> = {
  vibrant: "vivid saturated colors, bold complementary contrasts, eye-popping visual energy",
  sunset: "warm golden sunset, amber and coral oranges, deep magenta purple sky, cinematic dusk",
  forest: "rich deep greens, earthy warm browns, golden dappled sunlight, lush organic palette",
  neon: "electric neon glow, hot pink and cyan streaks, deep dark background, cyberpunk lighting",
  purple: "deep royal purple, indigo and violet hues, moody premium atmosphere, soft lilac highlights",
  monochrome: "high-contrast black and white, dramatic deep shadows, stark highlights, timeless B&W",
  ocean: "cool deep ocean blues, bright turquoise and teal, seafoam accents, crystal aquatic atmosphere",
  pastel: "soft dreamy pastel palette, light airy tones, gentle blush pinks and baby blues, calming",
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

/* ---------------- BUILD OPTIMIZED PROMPT (capped at 450 chars) ---------------- */

const buildPrompt = (
  title: string,
  user_prompt: string | undefined,
  style: string,
  color_scheme: string
): string => {
  const selectedStyle = stylePrompts[style] || stylePrompts["Bold & Graphic"];
  const selectedColor = colorSchemeDescriptions[color_scheme] || colorSchemeDescriptions["vibrant"];

  const subject =
    user_prompt && user_prompt.trim().length > 0
      ? user_prompt.trim().substring(0, 250)
      : `YouTube thumbnail: ${title}`;

  const prompt = `${subject}, ${selectedStyle}, ${selectedColor}, 8K ultra detailed, cinematic composition, no text no watermarks no logos, sharp focus`;

  return prompt.substring(0, 450);
};

/* ---------------- ASYNC BACKGROUND GENERATION ---------------- */

const generateImageInBackground = async (thumbnailId: string, fullPrompt: string): Promise<void> => {
  let imageBuffer: Buffer | null = null;

  const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/png,image/*,*/*",
  };

  /* 1. PRIMARY: Pollinations flux */
  try {
    const seed = Math.floor(Math.random() * 9999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&model=flux&seed=${seed}&nologo=true`;
    console.log(`🎨 [${thumbnailId}] Pollinations flux...`);
    const res = await axios.get(url, { responseType: "arraybuffer", headers: commonHeaders, timeout: 90000 });
    if (res.status === 200 && res.data?.byteLength > 5000) {
      imageBuffer = Buffer.from(res.data);
      console.log(`✅ [${thumbnailId}] flux OK: ${imageBuffer.length} bytes`);
    }
  } catch (e: any) {
    console.warn(`⚠️ [${thumbnailId}] flux failed: ${e.message}`);
  }

  /* 2. FALLBACK: Pollinations turbo */
  if (!imageBuffer) {
    try {
      const seed2 = Math.floor(Math.random() * 9999999);
      const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&model=turbo&seed=${seed2}&nologo=true`;
      console.log(`🎨 [${thumbnailId}] Pollinations turbo...`);
      const res2 = await axios.get(url2, { responseType: "arraybuffer", headers: commonHeaders, timeout: 60000 });
      if (res2.status === 200 && res2.data?.byteLength > 5000) {
        imageBuffer = Buffer.from(res2.data);
        console.log(`✅ [${thumbnailId}] turbo OK: ${imageBuffer.length} bytes`);
      }
    } catch (e: any) {
      console.warn(`⚠️ [${thumbnailId}] turbo failed: ${e.message}`);
    }
  }

  /* 3. LAST RESORT: HuggingFace FLUX.1-schnell */
  if (!imageBuffer && process.env.HF_API_KEY) {
    try {
      console.log(`🎨 [${thumbnailId}] HuggingFace FLUX.1-schnell...`);
      const hfRes = await axios.post(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        { inputs: fullPrompt },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "image/jpeg",
          },
          responseType: "arraybuffer",
          timeout: 60000,
        }
      );
      if (hfRes.status === 200 && hfRes.data) {
        imageBuffer = Buffer.from(hfRes.data);
        console.log(`✅ [${thumbnailId}] HuggingFace OK: ${imageBuffer.length} bytes`);
      }
    } catch (e: any) {
      console.warn(`⚠️ [${thumbnailId}] HuggingFace failed: ${e.message}`);
    }
  }

  if (!imageBuffer) {
    console.error(`❌ [${thumbnailId}] All engines failed.`);
    await Thumbnail.findByIdAndUpdate(thumbnailId, { isGenerating: false });
    return;
  }

  /* Upload to Cloudinary */
  let finalImageUrl = "";
  try {
    const cloudResult = await uploadBufferToCloudinary(imageBuffer);
    finalImageUrl = cloudResult.secure_url;
    console.log(`✅ [${thumbnailId}] Cloudinary OK: ${finalImageUrl}`);
  } catch (cloudErr: any) {
    console.warn(`⚠️ [${thumbnailId}] Cloudinary failed, using base64: ${cloudErr.message}`);
    finalImageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  }

  await Thumbnail.findByIdAndUpdate(thumbnailId, {
    image_url: finalImageUrl,
    isGenerating: false,
  });

  console.log(`🎉 [${thumbnailId}] Done!`);
};

/* ---------------- GENERATE THUMBNAIL (responds immediately) ---------------- */

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

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Thumbnail title is required." });
    }

    /* Save draft record immediately — this is what the client gets back */
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt || "",
      style: style || "Bold & Graphic",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: !!text_overlay,
      isGenerating: true,
    });

    const fullPrompt = buildPrompt(title, user_prompt, style || "Bold & Graphic", color_scheme || "vibrant");

    console.log(`🚀 [${thumbnail._id}] Async generation started`);
    console.log(`📝 Prompt: ${fullPrompt.substring(0, 120)}...`);

    /*
     * Fire-and-forget — generation happens AFTER we respond.
     * The client navigates to /generate/:id and polls every 5s
     * via fetchThumbnail() until isGenerating becomes false.
     */
    generateImageInBackground(thumbnail._id.toString(), fullPrompt).catch((err) => {
      console.error(`❌ Background crash [${thumbnail._id}]:`, err.message);
    });

    /* Respond immediately — no timeout risk */
    return res.json({
      message: "Thumbnail is being generated...",
      thumbnail,
    });

  } catch (error: any) {
    console.error("❌ Generate route error:", error.message);
    return res.status(500).json({
      message: error.message || "Thumbnail generation failed. Please try again.",
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