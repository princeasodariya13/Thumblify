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
    "dramatic YouTube thumbnail, studio-lit subject with strong rim lighting, bold vibrant colors, high contrast composition, powerful emotional expression, dynamic angle, sharp focus, striking visual impact, professional thumbnail photography",

  "Tech/Futuristic":
    "futuristic sci-fi scene, glowing blue and cyan holographic elements, dark sleek background, neon light accents, high-tech digital interface overlays, cinematic sci-fi lighting, ultra-detailed 3D render, cyberpunk aesthetic",

  "Minimalist":
    "clean minimalist composition, elegant simple layout, soft studio lighting, generous white or dark negative space, single focused subject, premium modern design, refined and sophisticated, muted harmonious palette",

  "Photorealistic":
    "hyperrealistic professional photo, Canon EOS R5 camera, 50mm prime lens, f/2.0 aperture, shallow depth of field, soft creamy bokeh, natural window light, sharp crisp subject focus, editorial magazine quality",

  "Illustrated":
    "vibrant digital art illustration, bold flat design, clean vector style, dynamic character design, pop-art color palette, comic-inspired shading, cel-shaded look, sharp line art, modern graphic novel aesthetic",
};

/* ---------------- COLOR SCHEMES ---------------- */

const colorSchemeDescriptions: Record<string, string> = {
  vibrant: "vivid saturated colors, electric hues, bold complementary contrasts, eye-popping visual energy",
  sunset: "warm golden sunset tones, rich amber and coral oranges, deep magenta purple sky gradient, cinematic dusk atmosphere",
  forest: "rich deep greens, earthy warm browns, golden dappled sunlight, lush organic natural palette",
  neon: "electric neon glow, hot pink and cyan light streaks, deep dark background, cyberpunk light painting effect",
  purple: "deep royal purple dominance, indigo and violet hues, moody and premium atmosphere, soft lilac highlights",
  monochrome: "high-contrast black and white, dramatic deep shadows, stark bright highlights, timeless B&W photography",
  ocean: "cool deep ocean blues, bright turquoise and teal, seafoam accents, crystal clear aquatic atmosphere",
  pastel: "soft dreamy pastel palette, light airy tones, gentle blush pinks and baby blues, delicate and calming",
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

/* ---------------- BUILD OPTIMIZED PROMPT ---------------- */

const buildPrompt = (
  title: string,
  user_prompt: string | undefined,
  style: string,
  color_scheme: string
): string => {
  const selectedStyle = stylePrompts[style] || stylePrompts["Bold & Graphic"];
  const selectedColor = colorSchemeDescriptions[color_scheme] || colorSchemeDescriptions["vibrant"];

  // Start with user's description (most specific detail first)
  let parts: string[] = [];

  if (user_prompt && user_prompt.trim().length > 0) {
    parts.push(user_prompt.trim());
  } else {
    // Derive subject from title if no custom prompt
    parts.push(`YouTube thumbnail image for: "${title}"`);
  }

  // Append style
  parts.push(selectedStyle);

  // Append color
  parts.push(selectedColor);

  // Universal quality boosters
  parts.push(
    "ultra high resolution 8K",
    "cinematic composition",
    "professional YouTube thumbnail",
    "16:9 aspect ratio",
    "no text, no watermarks, no logos",
    "highly detailed, sharp focus",
    "award-winning photography"
  );

  // Negative guidance appended as style direction
  parts.push(
    "avoid blurry, avoid distorted faces, avoid extra fingers, avoid cluttered composition, avoid gibberish text"
  );

  return parts.join(", ");
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

    /* ---------------- BUILD OPTIMIZED PROMPT ---------------- */

    const fullPrompt = buildPrompt(
      title,
      user_prompt,
      style || "Bold & Graphic",
      color_scheme || "vibrant"
    );

    console.log("🎨 Generating with prompt:", fullPrompt.substring(0, 200) + "...");

    let imageBuffer: Buffer | null = null;

    /* ---------------- 1. PRIMARY: FLUX.1-dev via Pollinations (best quality) ---------------- */
    try {
      const seed = Math.floor(Math.random() * 9999999);
      const fluxDevUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&model=flux&seed=${seed}&nologo=true&enhance=true`;
      
      console.log("Trying Flux (Pollinations)...");
      const aiResponse = await axios.get(fluxDevUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/webp,image/png,image/*,*/*",
        },
        timeout: 60000,
      });

      if (aiResponse.status === 200 && aiResponse.data && aiResponse.data.byteLength > 5000) {
        imageBuffer = Buffer.from(aiResponse.data);
        console.log(`✅ Flux generated image: ${imageBuffer.length} bytes`);
      }
    } catch (fluxErr: any) {
      console.warn("⚠️ Flux primary engine failed:", fluxErr.message);
    }

    /* ---------------- 2. FALLBACK: Flux-Realism via Pollinations ---------------- */
    if (!imageBuffer) {
      try {
        const seed2 = Math.floor(Math.random() * 9999999);
        const fluxRealismUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&model=flux-realism&seed=${seed2}&nologo=true`;
        
        console.log("Trying Flux-Realism fallback...");
        const fallbackResponse = await axios.get(fluxRealismUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 45000,
        });

        if (fallbackResponse.status === 200 && fallbackResponse.data && fallbackResponse.data.byteLength > 5000) {
          imageBuffer = Buffer.from(fallbackResponse.data);
          console.log(`✅ Flux-Realism fallback image: ${imageBuffer.length} bytes`);
        }
      } catch (fallbackErr: any) {
        console.warn("⚠️ Flux-Realism fallback failed:", fallbackErr.message);
      }
    }

    /* ---------------- 3. LAST RESORT: HuggingFace ---------------- */
    if (!imageBuffer && process.env.HF_API_KEY) {
      try {
        console.log("Trying HuggingFace last resort...");
        const hfResponse = await axios.post(
          "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
          { inputs: fullPrompt },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
              "Accept": "image/jpeg",
            },
            responseType: "arraybuffer",
            timeout: 45000,
          }
        );
        if (hfResponse.status === 200 && hfResponse.data) {
          imageBuffer = Buffer.from(hfResponse.data);
          console.log(`✅ HuggingFace fallback image: ${imageBuffer.length} bytes`);
        }
      } catch (hfErr: any) {
        console.warn("⚠️ HuggingFace fallback failed:", hfErr.message);
      }
    }

    if (!imageBuffer) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
      return res.status(500).json({ message: "Failed to generate AI thumbnail image. All engines failed. Please try again." });
    }

    /* ---------------- UPLOAD TO CLOUDINARY WITH FALLBACK ---------------- */
    let finalImageUrl = "";

    try {
      const cloudResult = await uploadBufferToCloudinary(imageBuffer);
      finalImageUrl = cloudResult.secure_url;
      console.log("✅ Uploaded to Cloudinary:", finalImageUrl);
    } catch (cloudErr: any) {
      console.warn("⚠️ Cloudinary upload failed, using base64:", cloudErr.message);
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
    console.error("❌ Thumbnail Error:", error.message);
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