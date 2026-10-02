import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import {
  analyzeThumbnailRequest,
  buildStrictFluxPrompt,
  validateImageRelevance,
  type DynamicSceneSpecification,
  type EnhanceOptions,
} from "../services/promptEnhancer.js";

// Ensure Cloudinary is initialized from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

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

/* ---------------- ASYNC BACKGROUND GENERATION WITH SEMANTIC VALIDATION & REGENERATION LOOP ---------------- */

const MAX_RETRIES = 2;

const fetchSingleImageBuffer = async (promptToUse: string, thumbnailId: string): Promise<Buffer | null> => {
  let imageBuffer: Buffer | null = null;
  const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/png,image/*,*/*",
  };

  /* 1. PRIMARY: HuggingFace FLUX.1-dev / FLUX.1-schnell */
  if (process.env.HF_API_KEY) {
    const hfModels = [
      "black-forest-labs/FLUX.1-dev",
      "black-forest-labs/FLUX.1-schnell",
    ];

    for (const modelPath of hfModels) {
      if (imageBuffer) break;
      try {
        console.log(`🎨 [${thumbnailId}] HuggingFace ${modelPath}...`);
        const hfRes = await axios.post(
          `https://router.huggingface.co/hf-inference/models/${modelPath}`,
          { inputs: promptToUse },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
              "Accept": "image/png,image/jpeg",
            },
            responseType: "arraybuffer",
            timeout: 30000,
          }
        );
        if (hfRes.status === 200 && hfRes.data && hfRes.data.byteLength > 5000) {
          imageBuffer = Buffer.from(hfRes.data);
          console.log(`✅ [${thumbnailId}] HuggingFace ${modelPath} OK: ${imageBuffer.length} bytes`);
        }
      } catch (e: any) {
        console.warn(`⚠️ [${thumbnailId}] HuggingFace ${modelPath} failed: ${e.message}`);
      }
    }
  }

  /* 2. SECONDARY: Pollinations FLUX */
  if (!imageBuffer) {
    try {
      const seed = Math.floor(Math.random() * 9999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=1280&height=720&model=flux&seed=${seed}&nologo=true`;
      console.log(`🎨 [${thumbnailId}] Pollinations flux...`);
      const res = await axios.get(url, { responseType: "arraybuffer", headers: commonHeaders, timeout: 25000 });
      if (res.status === 200 && res.data && (res.data.byteLength > 5000 || (Buffer.isBuffer(res.data) && res.data.length > 5000))) {
        imageBuffer = Buffer.from(res.data);
        console.log(`✅ [${thumbnailId}] Pollinations flux OK: ${imageBuffer.length} bytes`);
      }
    } catch (e: any) {
      console.warn(`⚠️ [${thumbnailId}] Pollinations flux failed: ${e.message}`);
    }
  }

  /* 3. FALLBACK: Pollinations turbo */
  if (!imageBuffer) {
    try {
      const seed2 = Math.floor(Math.random() * 9999999);
      const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=1280&height=720&model=turbo&seed=${seed2}&nologo=true`;
      console.log(`🎨 [${thumbnailId}] Pollinations turbo...`);
      const res2 = await axios.get(url2, { responseType: "arraybuffer", headers: commonHeaders, timeout: 20000 });
      if (res2.status === 200 && res2.data && (res2.data.byteLength > 5000 || (Buffer.isBuffer(res2.data) && res2.data.length > 5000))) {
        imageBuffer = Buffer.from(res2.data);
        console.log(`✅ [${thumbnailId}] Pollinations turbo OK: ${imageBuffer.length} bytes`);
      }
    } catch (e: any) {
      console.warn(`⚠️ [${thumbnailId}] Pollinations turbo failed: ${e.message}`);
    }
  }

  return imageBuffer;
};

const generateImageInBackground = async (
  thumbnailId: string,
  initialPrompt: string,
  sceneSpec: DynamicSceneSpecification
): Promise<void> => {
  let imageBuffer: Buffer | null = null;
  let attempt = 0;
  let currentPrompt = initialPrompt;

  // Semantic Generation & Validation Loop
  while (attempt <= MAX_RETRIES && !imageBuffer) {
    attempt++;
    console.log(`🚀 [${thumbnailId}] Generation Attempt ${attempt}/${MAX_RETRIES + 1}`);

    const candidateBuffer = await fetchSingleImageBuffer(currentPrompt, thumbnailId);

    if (candidateBuffer) {
      // Perform Semantic Relevance Validation
      const validation = await validateImageRelevance(candidateBuffer, sceneSpec);
      console.log(`🔍 [${thumbnailId}] Semantic Validation Score: ${validation.score} (Relevant: ${validation.relevant})`);

      if (validation.relevant) {
        imageBuffer = candidateBuffer;
        console.log(`✅ [${thumbnailId}] Semantic Validation Passed!`);
        break;
      } else {
        console.warn(
          `⚠️ [${thumbnailId}] Validation rejected attempt ${attempt}. Missing: ${validation.missingElements.join(
            ", "
          )}. Unexpected: ${validation.unexpectedElements.join(", ")}`
        );
        // Correct prompt for retry attempt
        currentPrompt = `STRICT ACCURATE SCENE RE-RENDER: Ensure primary visual subject (${sceneSpec.primarySubject}) is the dominant centerpiece. ABSOLUTELY NO ${sceneSpec.forbiddenElements.slice(0, 5).join(", ")}.\n\n${initialPrompt}`;
      }
    } else {
      console.warn(`⚠️ [${thumbnailId}] Attempt ${attempt} failed to produce image buffer.`);
    }
  }

  if (!imageBuffer) {
    console.error(`❌ [${thumbnailId}] All engines and retries failed.`);
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
    console.warn(`⚠️ [${thumbnailId}] Cloudinary failed, using base64 fallback: ${cloudErr.message}`);
    finalImageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  }

  await Thumbnail.findByIdAndUpdate(thumbnailId, {
    image_url: finalImageUrl,
    isGenerating: false,
  });

  console.log(`🎉 [${thumbnailId}] Done!`);
};

/* ---------------- REGENERATE THUMBNAIL (update existing, responds immediately) ---------------- */

export const regenerateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not logged in." });
    }

    const thumbnail = await Thumbnail.findOne({ _id: id, userId });
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found." });
    }

    // Get optional updated fields from body
    const { title, prompt: user_prompt, style, aspect_ratio, color_scheme } = req.body;

    // Update fields if provided
    if (title && title.trim()) thumbnail.title = title.trim();
    if (user_prompt !== undefined) thumbnail.prompt_used = user_prompt;
    if (style) thumbnail.style = style;
    if (aspect_ratio) thumbnail.aspect_ratio = aspect_ratio;
    if (color_scheme) thumbnail.color_scheme = color_scheme;

    // Reset generation state
    thumbnail.isGenerating = true;
    thumbnail.image_url = "";
    await thumbnail.save();

    const options: EnhanceOptions = {
      title: thumbnail.title,
      style: thumbnail.style || "Bold & Graphic",
      color_scheme: thumbnail.color_scheme || "vibrant",
      aspect_ratio: thumbnail.aspect_ratio || "16:9",
      text_overlay: thumbnail.text_overlay,
    };

    const sceneSpec = analyzeThumbnailRequest(thumbnail.prompt_used || "", options);
    const fullPrompt = buildStrictFluxPrompt(sceneSpec, options);

    console.log(`🔄 [${thumbnail._id}] Regenerating async...`);
    console.log(`✨ Scene Intent: "${sceneSpec.intent}"`);

    generateImageInBackground(thumbnail._id.toString(), fullPrompt, sceneSpec).catch((err) => {
      console.error(`❌ Regen crash [${thumbnail._id}]:`, err.message);
    });

    return res.json({
      message: "Thumbnail is being regenerated...",
      thumbnail,
    });

  } catch (error: any) {
    console.error("❌ Regenerate route error:", error.message);
    return res.status(500).json({
      message: error.message || "Regeneration failed. Please try again.",
    });
  }
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

    /* Save draft record immediately */
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

    const options: EnhanceOptions = {
      title,
      style: style || "Bold & Graphic",
      color_scheme: color_scheme || "vibrant",
      aspect_ratio: aspect_ratio || "16:9",
      text_overlay: !!text_overlay,
    };

    const sceneSpec = analyzeThumbnailRequest(user_prompt || "", options);
    const fullPrompt = buildStrictFluxPrompt(sceneSpec, options);

    console.log(`🚀 [${thumbnail._id}] Async generation started`);
    console.log(`✨ Scene Intent: "${sceneSpec.intent}"`);

    /* Fire-and-forget generation */
    generateImageInBackground(thumbnail._id.toString(), fullPrompt, sceneSpec).catch((err) => {
      console.error(`❌ Background crash [${thumbnail._id}]:`, err.message);
    });

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
      isPublic: thumbnail.isPublic,
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
      .populate("userId", "name")
      .limit(50);

    return res.json({ thumbnails });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};