export interface EnhanceOptions {
  title?: string;
  style?: string;
  color_scheme?: string;
  aspect_ratio?: string;
  category?: string;
  mood?: string;
  text_overlay?: boolean;
}

interface CategoryDetails {
  categoryName: string;
  mainSubject: string;
  visualStory: string;
  background: string;
  composition: string;
  lighting: string;
  defaultMood: string;
  colorDirection: string;
}

/* ---------------- TOPIC INTELLIGENCE ---------------- */

const categoryKeywordMap: Record<string, RegExp> = {
  Finance: /\b(stock|market|invest|investment|crypto|bitcoin|btc|trading|money|finance|economy|business|profit|bank|wealth|passive income|real estate|wall street|dollar|inflation|shares|trade|crash|recession)\b/i,
  Technology: /\b(react|node|python|js|javascript|code|coding|developer|software|programming|ai|artificial intelligence|tech|web|app|api|backend|frontend|fullstack|docker|kubernetes|git|github|sql|database|machine learning|cloud|cyber|linux|html|css|typescript|nextjs|vue|angular|java|c\+\+|rust|algo|interview)\b/i,
  Gaming: /\b(gta|gaming|game|gameplay|minecraft|fortnite|valorant|ps5|xbox|nintendo|esport|streamer|pc build|roblox|apex|cod|call of duty|walkthrough|boss|speedrun|gamer)\b/i,
  Education: /\b(how does|why|science|physics|chemistry|biology|history|math|lesson|tutorial|explain|explained|photosynthesis|space|universe|planet|geography|medical|learn|roadmap|guide|mastery)\b/i,
  Fitness: /\b(workout|muscle|gym|fitness|fat loss|weight loss|exercise|training|diet|bodybuilder|bodybuilding|routine|health|abs|arms|cardio|calisthenics|strength)\b/i,
  News: /\b(news|breaking|revolution|trend|future|update|2026|2025|world|global|election|war|scandal|drama|commentary|report)\b/i,
  Lifestyle: /\b(vlog|day in the life|travel|food|routine|morning|aesthetic|room tour|setup|habits|productivity|focus|lifestyle)\b/i,
  Entertainment: /\b(movie|film|top 10|mystery|horror|scary|review|trailer|music|podcast|show|cinema|story|secret)\b/i,
};

const detectCategory = (text: string, fallbackCategory?: string): string => {
  if (fallbackCategory && fallbackCategory.trim()) {
    return fallbackCategory.trim();
  }
  
  for (const [category, regex] of Object.entries(categoryKeywordMap)) {
    if (regex.test(text)) {
      return category;
    }
  }
  
  return "General";
};

/* ---------------- CATEGORY TEMPLATES ---------------- */

const getCategoryTemplate = (category: string, userText: string): CategoryDetails => {
  switch (category) {
    case "Technology":
      return {
        categoryName: "Technology & Software Development",
        mainSubject: `a confident software developer at a modern workstation focusing on ${userText}`,
        visualStory: `working with a large dual-monitor setup displaying clean code, glowing developer interface elements, and floating technology nodes`,
        background: "a sleek dark-themed software developer studio with ambient neon lights, server rack accents, and a high-tech minimalist desk",
        composition: "dynamic 3/4 perspective, subject positioned on one side leaving clean negative space on the opposite side for headline text overlay",
        lighting: "dramatic studio rim lighting with soft cyan and magenta ambient light accents",
        defaultMood: "energetic, innovative, and highly professional",
        colorDirection: "deep navy and charcoal background with vibrant cyan, electric blue, and purple highlights",
      };

    case "Finance":
      return {
        categoryName: "Finance & Market Analytics",
        mainSubject: `a dynamic financial visual scene analyzing ${userText}`,
        visualStory: `featuring high-impact 3D stock market candlestick charts, dramatic trend arrows, and glowing financial exchange indicators`,
        background: "a high-contrast financial trading floor backdrop with atmospheric glass panels and dark moody background depth",
        composition: "powerful side-weighted composition with clear focal point, leaving clean negative space for overlay title text",
        lighting: "cinematic high-contrast studio lighting with warm golden edge highlights and deep dramatic shadows",
        defaultMood: "intense, high-stakes, authoritative, and impactful",
        colorDirection: "rich dark emerald greens, deep obsidian tones, golden amber, and energetic crimson accents",
      };

    case "Gaming":
      return {
        categoryName: "Gaming & Esports",
        mainSubject: `an expressive gamer in an intense gaming scene centered around ${userText}`,
        visualStory: `immersed in a cinematic game world with atmospheric particle effects, custom gaming controller, and high-octane action visual elements`,
        background: "a futuristic battlestation with vibrant RGB strip lighting, water-cooled PC setup, and subtle atmospheric smoke",
        composition: "action-packed wide 16:9 composition with a strong central focal point and clean side space for text overlay",
        lighting: "intense RGB dual-tone lighting with electric highlights and neon rim lights",
        defaultMood: "thrilling, high-energy, competitive, and cinematic",
        colorDirection: "deep dark backdrop with electric hot pink, neon cyan, and fiery orange streaks",
      };

    case "Education":
      return {
        categoryName: "Education & Explainer Visuals",
        mainSubject: `a clean 3D scientific and educational visualization of ${userText}`,
        visualStory: `showcasing interactive 3D conceptual diagrams, floating educational icons, and clear visual breakdown graphics`,
        background: "a modern laboratory, futuristic museum, or minimalist educational studio with soft ambient depth",
        composition: "crisp wide angle 16:9 arrangement with clear focal point and open negative space for text overlay",
        lighting: "bright high-key studio illumination with crystal clear focus and soft accent highlights",
        defaultMood: "engaging, curious, educational, and inspiring",
        colorDirection: "clean white and slate tones paired with rich sapphire blue and emerald accents",
      };

    case "Fitness":
      return {
        categoryName: "Fitness & Strength",
        mainSubject: `an athletic person in peak physical condition training for ${userText}`,
        visualStory: `performing high-intensity workout in a gym setting with iron dumbbells, chalk dust, and powerful fitness movement graphics`,
        background: "an industrial high-end training gym with exposed brick wall, heavy squat racks, and dramatic directional spotlights",
        composition: "powerful athletic framing, subject positioned on one side with clean negative space on the opposite side for headline text",
        lighting: "dramatic chiseled spotlighting with muscular shadows and vivid rim lighting",
        defaultMood: "motivating, powerful, intense, and disciplined",
        colorDirection: "dark metallic slate and charcoal with intense orange, crimson, or warm amber highlights",
      };

    case "News":
      return {
        categoryName: "News & Current Events",
        mainSubject: `a high-impact news broadcast environment focusing on ${userText}`,
        visualStory: `presenting critical insights with global newsroom graphics, world map overlays, and dramatic event visual elements`,
        background: "a state-of-the-art news studio with LED video wall panels and deep atmospheric lighting",
        composition: "cinematic widescreen 16:9 composition, subject positioned off-center to leave clear negative space for headline text",
        lighting: "professional broadcast studio lighting with high contrast and vivid accent lights",
        defaultMood: "urgent, serious, groundbreaking, and authoritative",
        colorDirection: "deep dark blue and obsidian with bold red, bright white, and gold accents",
      };

    case "Lifestyle":
      return {
        categoryName: "Lifestyle & Personal Development",
        mainSubject: `a warm, aesthetic lifestyle creator demonstrating ${userText}`,
        visualStory: `in a stylish organized environment showcasing productivity tools, coffee, and inspiring lifestyle aesthetics`,
        background: "a sunlit modern loft or cozy Scandinavian room with warm wood accents, green indoor plants, and natural soft bokeh",
        composition: "welcoming 3/4 portrait framing with balanced composition and clean space for overlay text",
        lighting: "golden hour natural window illumination with soft diffused fill light",
        defaultMood: "authentic, inspiring, aesthetic, and welcoming",
        colorDirection: "warm natural tones, beige, soft coral, sage green, and golden sunlight",
      };

    case "Entertainment":
      return {
        categoryName: "Entertainment & Pop Culture",
        mainSubject: `an intriguing cinematic visual scene representing ${userText}`,
        visualStory: `capturing an emotional turning point, high-stakes reveal, or cinematic mystery scene`,
        background: "a movie-set backdrop with atmospheric fog, spotlight beams, and high-contrast shadows",
        composition: "dramatic cinematic framing with strong focal point and clear negative space for text overlay",
        lighting: "moody film-noir style lighting, high-contrast chiaroscuro, and vivid rim light accents",
        defaultMood: "mysterious, exciting, dramatic, and captivating",
        colorDirection: "rich moody blues, deep violet, magenta highlights, and dark shadows",
      };

    default:
      return {
        categoryName: "Commercial Content",
        mainSubject: `a prominent high-impact visual representation of ${userText}`,
        visualStory: `combining clear visual storytelling, striking symbolic elements, and professional commercial design related to ${userText}`,
        background: "a polished studio environment with subtle geometric textures, dynamic light beams, and modern visual depth",
        composition: "professional 16:9 YouTube thumbnail layout with single primary focal point and uncluttered negative space",
        lighting: "dramatic studio lighting with strong key light and vibrant edge highlights",
        defaultMood: "engaging, high quality, commercial, and eye-catching",
        colorDirection: "vibrant saturated primary tones with rich high-contrast dark accents",
      };
  }
};

/* ---------------- PROMPT ENHANCEMENT ENGINE ---------------- */

/**
 * Enhances a simple user prompt into a structured, highly-detailed FLUX.1-dev prompt
 * optimized specifically for professional 16:9 YouTube thumbnails.
 */
export const enhanceThumbnailPrompt = (
  userPrompt: string,
  options: EnhanceOptions = {}
): string => {
  const inputTitle = options.title?.trim() || "";
  const inputPrompt = userPrompt?.trim() || "";

  // Deduplicate title and prompt if identical or overlapping
  let cleanSubjectText = "";
  if (inputTitle && inputPrompt) {
    if (inputTitle.toLowerCase() === inputPrompt.toLowerCase()) {
      cleanSubjectText = inputTitle;
    } else if (inputTitle.toLowerCase().includes(inputPrompt.toLowerCase())) {
      cleanSubjectText = inputTitle;
    } else if (inputPrompt.toLowerCase().includes(inputTitle.toLowerCase())) {
      cleanSubjectText = inputPrompt;
    } else {
      cleanSubjectText = `${inputTitle}, ${inputPrompt}`;
    }
  } else {
    cleanSubjectText = inputTitle || inputPrompt || "Professional Topic";
  }

  // 1. Detect Category via Regex Word-Boundary Intelligence
  const category = detectCategory(cleanSubjectText, options.category);
  const details = getCategoryTemplate(category, cleanSubjectText);

  // 2. Style Modifiers
  const styleModifiers: Record<string, string> = {
    "Bold & Graphic": "bold graphic thumbnail aesthetic, high visual impact, crisp sharp focus, striking commercial photography",
    "Tech/Futuristic": "futuristic tech aesthetic, glowing neon circuitry, sci-fi digital elements, sleek cyber illumination",
    "Minimalist": "clean minimalist commercial design, elegant negative space, refined studio lighting, single focused hero subject",
    "Photorealistic": "hyperrealistic studio photograph, shot on 35mm lens, f/1.8 aperture, natural depth of field, sharp subject detail",
    "Illustrated": "vibrant 3D digital illustration, bold pop-art graphics, clean stylized line art, modern vector aesthetics",
  };
  const selectedStyle = styleModifiers[options.style || ""] || styleModifiers["Bold & Graphic"];

  // 3. Color Scheme Modifiers
  const colorModifiers: Record<string, string> = {
    vibrant: "vivid saturated color palette, high contrast complementary colors, eye-popping visual energy",
    sunset: "warm golden hour palette, deep amber oranges, coral reds, and twilight magenta shadows",
    forest: "deep emerald greens, rich earthy tones, dappled golden sunlight, organic atmosphere",
    neon: "electric pink and neon cyan streaks, deep dark backdrop, vibrant cyberpunk illumination",
    purple: "royal purple and violet tones, magenta glow, deep indigo shadows, elegant lighting",
    monochrome: "high contrast black and white, dramatic deep shadows, stark highlights, editorial tone",
    ocean: "deep sapphire blues, bright turquoise, crisp teal highlights, crystal aquatic atmosphere",
    pastel: "soft airy pastel tones, gentle blush and mint highlights, clean bright illumination",
  };
  const selectedColor = colorModifiers[options.color_scheme || ""] || details.colorDirection;

  // 4. Build Internal Technical Structure
  const internalStructure = {
    TOPIC: `${details.categoryName} - "${cleanSubjectText}"`,
    MAIN_SUBJECT: details.mainSubject,
    VISUAL_STORY: details.visualStory,
    BACKGROUND: details.background,
    COMPOSITION: `16:9 YouTube thumbnail ratio, ${details.composition}`,
    SUBJECT_POSITION: "Subject positioned intentionally on one side, leaving clean, open negative space on the opposite side specifically reserved for bold headline text overlays",
    LIGHTING: details.lighting,
    MOOD: options.mood || details.defaultMood,
    COLOR_DIRECTION: selectedColor,
    THUMBNAIL_STYLE: `${selectedStyle}, commercial quality, high contrast, visually clear and understandable even at small thumbnail size on mobile screens`,
    NEGATIVE_INSTRUCTIONS: "NO rendered text on background image, NO written typography, NO letters, NO numbers, NO watermarks, NO logos, NO distorted faces, NO blurry elements, NO messy background clutter",
  };

  // 5. Convert Structured Fields into a Cohesive FLUX Natural-Language Prompt
  const finalEnhancedPrompt = [
    `Professional YouTube thumbnail visual for ${internalStructure.TOPIC}.`,
    `Main Subject: ${internalStructure.MAIN_SUBJECT}, ${internalStructure.VISUAL_STORY}.`,
    `Background: ${internalStructure.BACKGROUND}.`,
    `Composition: ${internalStructure.COMPOSITION}.`,
    `Subject Position: ${internalStructure.SUBJECT_POSITION}.`,
    `Lighting: ${internalStructure.LIGHTING}.`,
    `Mood & Tone: ${internalStructure.MOOD}.`,
    `Color Palette: ${internalStructure.COLOR_DIRECTION}.`,
    `Style & Quality: ${internalStructure.THUMBNAIL_STYLE}.`,
    `Crucial Rendering Rules: ${internalStructure.NEGATIVE_INSTRUCTIONS}.`,
  ].join(" ");

  return finalEnhancedPrompt;
};
