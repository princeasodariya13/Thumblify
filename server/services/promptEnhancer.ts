export interface EnhanceOptions {
  title?: string;
  style?: string;
  color_scheme?: string;
  aspect_ratio?: string;
  category?: string;
  mood?: string;
  text_overlay?: boolean;
}

interface TopicAnalysis {
  categoryName: string;
  primarySubject: string;
  requiredVisualElements: string[];
  visualStory: string;
  environment: string;
  composition: string;
  cameraView: string;
  lighting: string;
  colorDirection: string;
  humanRequired: boolean;
  humanReason?: string;
}

/* ---------------- HUMAN REQUIREMENT REGEX DETECTOR ---------------- */

// Detect topics where humans ARE relevant/required
const humanRequiredRegex = /\b(virat|kohli|ronaldo|messi|elon|musk|modi|trump|biden|workout|muscle|fitness|bodybuilding|calisthenics|gym|athlete|boxer|actor|actress|singer|vlogger|vlog|day in the life|interview with|person|man|woman|guy|girl|celebrity)\b/i;

// Detect hardware/product, cars, tech, finance, education queries where humans are STRICTLY FORBIDDEN
const productOrObjectRegex = /\b(earbuds|headphone|phone|iphone|macbook|laptop|camera|car|bmw|audi|mercedes|tesla|porsche|ferrari|setup|pc build|keyboard|mouse|monitor|gpu|rtx|cpu)\b/i;

/* ---------------- CATEGORY DETECTORS ---------------- */

const categoryKeywordMap: Record<string, RegExp> = {
  Product: /\b(earbuds|headphones|iphone|macbook|laptop|camera|gadget|hardware|gear|watch|tech review|unboxing|phone|mouse|keyboard|monitor|gpu)\b/i,
  Automotive: /\b(car|bmw|audi|mercedes|tesla|porsche|ferrari|lamborghini|mustang|ford|toyota|honda|supercar|vehicle|drive|test drive|automotive)\b/i,
  Finance: /\b(stock|market|invest|investment|crypto|bitcoin|btc|trading|money|finance|economy|business|profit|bank|wealth|passive income|real estate|wall street|dollar|inflation|shares|trade|crash|recession)\b/i,
  Programming: /\b(react|node|python|js|javascript|code|coding|developer|software|programming|ai|artificial intelligence|tech|web|app|api|backend|frontend|fullstack|docker|kubernetes|git|github|sql|database|mongodb|machine learning|cloud|cyber|linux|html|css|typescript|nextjs|vue|angular|java|c\+\+|rust|algo|interview)\b/i,
  Gaming: /\b(gta|gaming|game|gameplay|minecraft|fortnite|valorant|ps5|xbox|nintendo|esport|streamer|pc build|roblox|apex|cod|call of duty|walkthrough|boss|speedrun|gamer)\b/i,
  Education: /\b(how does|why|science|physics|chemistry|biology|history|math|lesson|tutorial|explain|explained|photosynthesis|space|universe|planet|geography|medical|learn|roadmap|guide|mastery)\b/i,
  Fitness: /\b(workout|muscle|gym|fitness|fat loss|weight loss|exercise|training|diet|bodybuilder|bodybuilding|routine|health|abs|arms|cardio|calisthenics|strength)\b/i,
  News: /\b(news|breaking|revolution|trend|future|update|2026|2025|world|global|election|war|scandal|drama|commentary|report)\b/i,
  Lifestyle: /\b(vlog|day in the life|travel|food|routine|morning|aesthetic|room tour|setup|habits|productivity|focus|lifestyle)\b/i,
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

/* ---------------- TOPIC ANALYSIS ENGINE ---------------- */

const analyzeTopicIntent = (cleanTopic: string, userCategory: string): TopicAnalysis => {
  const category = detectCategory(cleanTopic, userCategory);
  const isProductOrCar = productOrObjectRegex.test(cleanTopic);
  const isHumanExplicitlyNeeded = humanRequiredRegex.test(cleanTopic) && !isProductOrCar;

  switch (category) {
    case "Product":
      return {
        categoryName: "Hardware & Product Technology",
        primarySubject: `Premium ${cleanTopic} as the dominant centerpiece, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Detailed high-end product photography of ${cleanTopic}`,
          "Sleek charging case, acoustics, or premium accessories",
          "Subtle glowing soundwave, tech data, or dynamic signal elements",
          "Clean minimalist studio backdrop highlighting fine product materials and metallic texture",
        ],
        visualStory: `Showcasing the flagship design, craftsmanship, and technology of ${cleanTopic}`,
        environment: "A high-tech studio environment with polished dark slate glass, soft geometric reflections, and clean studio pedestal",
        composition: "Central product focal point occupying 50-70% of the frame, framed to leave clean negative space on the left or right side for headline text",
        cameraView: "Crisp macro product perspective, shallow depth of field, sharp foreground focus",
        lighting: "Precision commercial studio rim lighting, subtle cyan and metallic reflections",
        colorDirection: "Sleek dark obsidian and silver slate with vibrant electric accents",
        humanRequired: false,
      };

    case "Automotive":
      return {
        categoryName: "Automotive & Supercars",
        primarySubject: `A striking ${cleanTopic} dominating 50-70% of the visual frame`,
        requiredVisualElements: [
          `Detailed high-performance ${cleanTopic} vehicle`,
          "Glossy metallic paint reflection, aggressive front grille, and LED headlight illumination",
          "Dynamic asphalt road or high-end architectural garage backdrop",
          "Motion blur on wheels or crisp static showroom stance",
        ],
        visualStory: `Communicating raw horsepower, sleek design, and high-performance automotive engineering`,
        environment: "An atmospheric coastal highway at dusk or a modern architectural concrete garage with ambient overhead lighting",
        composition: "Low-angle 3/4 front perspective dominating 50-70% of the frame, positioned to leave clean negative space for overlay text",
        cameraView: "Dynamic low-angle automotive photography, crisp lens focus",
        lighting: "Cinematic golden hour streak lighting with dramatic reflections along the body panels",
        colorDirection: "Deep dark asphalt slate, metallic silver, amber sunset highlights, and crimson taillight accents",
        humanRequired: false,
      };

    case "Programming":
      return {
        categoryName: "Programming & Software Technology",
        primarySubject: `A professional software development environment centered on ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `A clean Code Editor / IDE displaying active syntax-highlighted code for ${cleanTopic}`,
          "Modern high-resolution workstation monitor or laptop display",
          `Floating glowing technology symbols and conceptual interface cards related to ${cleanTopic}`,
          "Sleek developer workspace setup with clean dark theme background",
        ],
        visualStory: `Communicating high-level software engineering, problem solving, and technical mastery in ${cleanTopic}`,
        environment: "A modern dark-themed developer studio with subtle neon ambient lighting, server rack accents, and a minimalist tech desk",
        composition: "3/4 medium angle shot with code editor and monitor dominating 50-70% of the frame, positioned intentionally to leave clean negative space on one side for headline text",
        cameraView: "Eye-level technical workstation camera view, sharp focus on screen details",
        lighting: "Dramatic studio rim lighting combined with soft cyan, electric blue, and purple glow from monitors",
        colorDirection: "Deep navy and charcoal background with vibrant cyan, electric blue, and magenta highlights",
        humanRequired: isHumanExplicitlyNeeded,
        humanReason: isHumanExplicitlyNeeded ? "An expert software developer actively working on code" : undefined,
      };

    case "Finance":
      return {
        categoryName: "Finance & Market Analytics",
        primarySubject: `A high-impact 3D stock market and financial trend visualization for ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Dramatic 3D candlestick stock chart, downward/upward market graphs for ${cleanTopic}`,
          "Glowing financial trading dashboard, ticker numbers, and exchange data screens",
          "Dynamic high-contrast trend arrows and market indicator graphics",
          "High-contrast financial trading floor or atmospheric office depth",
        ],
        visualStory: `Visually representing market volatility, economic trends, and financial analysis`,
        environment: "A high-contrast financial exchange background with atmospheric glass screens and dark moody depth",
        composition: "Powerful side-weighted 16:9 composition where stock chart and trading visuals dominate 50-70% of the frame, leaving clean negative space for text",
        cameraView: "Slightly low-angle dynamic graph perspective, sharp focal contrast",
        lighting: "Cinematic high-contrast lighting with warm golden edge highlights and deep dramatic red/green graph lights",
        colorDirection: "Rich dark emerald greens, deep obsidian tones, golden amber, and energetic crimson red accents",
        humanRequired: false,
      };

    case "Gaming":
      return {
        categoryName: "Gaming & Esports",
        primarySubject: `An immersive gaming environment centered around ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Iconic gaming world visual elements and cinematic atmosphere for ${cleanTopic}`,
          "Next-gen gaming controller, PC gaming rig, or water-cooled battlestation setup",
          "Vibrant RGB lighting strips and floating gaming particle effects",
          "High-octane action atmosphere and cinematic game world depth",
        ],
        visualStory: `Capturing the thrill, competitive energy, and cinematic visuals of ${cleanTopic}`,
        environment: "A high-tech gaming room with atmospheric smoke, neon ambient lights, and custom gaming peripherals",
        composition: "Action-packed wide 16:9 composition with gaming hardware or cinematic game scene occupying 50-70% of the frame, leaving clean negative space for text",
        cameraView: "Dynamic wide perspective with deep field depth",
        lighting: "Intense RGB dual-tone lighting with electric cyan highlights and hot pink rim lights",
        colorDirection: "Deep dark backdrop with electric hot pink, neon cyan, and fiery orange streaks",
        humanRequired: isHumanExplicitlyNeeded,
        humanReason: isHumanExplicitlyNeeded ? "An expressive gamer reacting in an intense gaming session" : undefined,
      };

    case "Education":
      return {
        categoryName: "Education & Science Explainer",
        primarySubject: `A clean, 3D scientific diagram and educational model of ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Detailed 3D scientific model or process visualization for ${cleanTopic} (e.g. plant leaves, sunlight rays, energy flow)`,
          "Floating educational breakdown icons and conceptual infographic structures",
          "Clean laboratory, nature, or scientific studio environment",
          "Crisp visual hierarchy communicating key educational concepts",
        ],
        visualStory: `Breaking down complex scientific concepts into an engaging visual story`,
        environment: "A modern science laboratory, futuristic museum display, or clean educational studio with soft lighting",
        composition: "Clean wide 16:9 arrangement where scientific subject occupies 50-70% of the frame, leaving uncluttered space for headline text",
        cameraView: "Clear frontal or 3/4 explanatory view with sharp focal clarity",
        lighting: "Bright high-key studio illumination, crystal clear focus, soft rim highlights",
        colorDirection: "Clean white and slate background paired with rich sapphire blue, emerald green, and golden energy accents",
        humanRequired: false,
      };

    case "Fitness":
      return {
        categoryName: "Fitness & Strength",
        primarySubject: `An athletic trainer performing a high-intensity workout for ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `An athletic person in peak physical condition performing a workout for ${cleanTopic}`,
          "Iron dumbbells, heavy squat rack, or gym training equipment",
          "Atmospheric chalk dust particles and dynamic fitness movement",
          "High-end industrial gym environment",
        ],
        visualStory: `Communicating strength, physical transformation, discipline, and intense training`,
        environment: "An industrial gym with exposed brick walls, heavy iron weights, and dramatic overhead spotlights",
        composition: "Powerful athletic framing with body and equipment occupying 50-70% of the frame, aligned on one side to leave negative space for text",
        cameraView: "Low-angle athletic portrait view, sharp muscular focus",
        lighting: "Dramatic chiseled spotlighting with muscular shadows and vivid rim lighting",
        colorDirection: "Dark metallic slate and charcoal with intense orange, crimson, or warm amber highlights",
        humanRequired: true,
        humanReason: "An athletic person performing the fitness workout",
      };

    case "News":
      return {
        categoryName: "News & Current Events",
        primarySubject: `A high-impact news broadcast environment focusing on ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Dramatic event visual elements or news graphics representing ${cleanTopic}`,
          "Glowing global newsroom LED video wall panels and world map graphics",
          "High-contrast news studio environment with depth and authority",
          "Bold visual icons indicating breaking news or major reports",
        ],
        visualStory: `Delivering urgent, authoritative news updates on global topics`,
        environment: "A state-of-the-art broadcast newsroom with LED wall graphics and atmospheric depth",
        composition: "Cinematic 16:9 framing, news visuals occupying 50-70% of the frame, leaving clean negative space for title overlay",
        cameraView: "Broadcast camera angle with deep studio background blur",
        lighting: "Professional newsroom studio lighting with high contrast and vivid red/gold accent lights",
        colorDirection: "Deep dark blue and obsidian with bold red, bright white, and gold accents",
        humanRequired: isHumanExplicitlyNeeded,
        humanReason: isHumanExplicitlyNeeded ? "A news anchor presenting breaking news" : undefined,
      };

    case "Lifestyle":
      return {
        categoryName: "Lifestyle & Vlogs",
        primarySubject: `An aesthetic, warm lifestyle scene centered around ${cleanTopic}, occupying 50-70% of the frame`,
        requiredVisualElements: [
          `Aesthetic lifestyle items, coffee, notebook, or setup related to ${cleanTopic}`,
          "Modern sunlit loft or cozy Scandinavian studio backdrop",
          "Warm natural lighting and soft blurred background depth",
        ],
        visualStory: `Sharing authentic daily experiences, routines, and personal development`,
        environment: "A sunlit modern loft with indoor plants, wooden desk, and natural soft bokeh",
        composition: "Welcoming framing occupying 50-70% of frame with balanced side negative space for headline text",
        cameraView: "Eye-level natural portrait view, soft background depth",
        lighting: "Warm golden hour window light with gentle fill",
        colorDirection: "Warm natural tones, beige, soft coral, sage green, and golden sunlight",
        humanRequired: isHumanExplicitlyNeeded,
        humanReason: isHumanExplicitlyNeeded ? "A content creator sharing their daily vlog" : undefined,
      };

    default:
      return {
        categoryName: "Topic-Focused Visual Scene",
        primarySubject: `A prominent, high-impact visual representation of ${cleanTopic}, occupying 50-70% of the visual frame`,
        requiredVisualElements: [
          `Direct visual objects and symbolic elements representing ${cleanTopic}`,
          "Polished studio environment with subtle geometric textures",
          "High contrast visual elements communicating the core topic clearly at small size",
        ],
        visualStory: `Communicating ${cleanTopic} clearly with strong visual storytelling and zero fluff`,
        environment: "A polished studio background with clean lighting and modern visual depth",
        composition: "Strong 16:9 thumbnail layout with primary subject occupying 50-70% of frame, leaving clean negative space for headline text overlay",
        cameraView: "Crisp medium shot perspective with sharp focal clarity",
        lighting: "Dramatic commercial studio lighting with key light and edge highlights",
        colorDirection: "Vibrant saturated primary tones with rich high-contrast dark accents",
        humanRequired: isHumanExplicitlyNeeded,
        humanReason: isHumanExplicitlyNeeded ? `A person relevant to ${cleanTopic}` : undefined,
      };
  }
};

/* ---------------- PROMPT ENHANCEMENT ENGINE ---------------- */

/**
 * Enhances a user prompt into a STRICT TOPIC-LOCKED FLUX.1-dev prompt
 * using the mandatory structured layout.
 */
export const enhanceThumbnailPrompt = (
  userPrompt: string,
  options: EnhanceOptions = {}
): string => {
  const inputTitle = options.title?.trim() || "";
  const inputPrompt = userPrompt?.trim() || "";

  // 1. Deduplicate & Clean Topic Text
  let cleanTopic = "";
  if (inputTitle && inputPrompt) {
    if (inputTitle.toLowerCase() === inputPrompt.toLowerCase()) {
      cleanTopic = inputTitle;
    } else if (inputTitle.toLowerCase().includes(inputPrompt.toLowerCase())) {
      cleanTopic = inputTitle;
    } else if (inputPrompt.toLowerCase().includes(inputTitle.toLowerCase())) {
      cleanTopic = inputPrompt;
    } else {
      cleanTopic = `${inputTitle}, ${inputPrompt}`;
    }
  } else {
    cleanTopic = inputTitle || inputPrompt || "Topic";
  }

  // Fallback protection if cleaning yields empty string
  if (!cleanTopic || !cleanTopic.trim()) {
    cleanTopic = "Thumbnail Topic";
  }

  // 2. Topic Analysis & Human Logic Determination
  const analysis = analyzeTopicIntent(cleanTopic, options.category || "");

  // 3. Style Modifiers
  const styleMap: Record<string, string> = {
    "Bold & Graphic": "High contrast bold graphic commercial YouTube thumbnail style with striking visual punch",
    "Tech/Futuristic": "Sci-fi high-tech digital aesthetic with glowing neon circuitry and holographic overlays",
    "Minimalist": "Clean minimalist commercial product style with refined negative space and elegant focal framing",
    "Photorealistic": "Hyperrealistic commercial studio photography, shot on 35mm lens, sharp focus, 8K detail",
    "Illustrated": "Vibrant 3D digital illustration, bold pop-art graphics, clean stylized artwork",
  };
  const selectedStyle = styleMap[options.style || ""] || styleMap["Bold & Graphic"];

  // 4. Color Modifiers
  const colorMap: Record<string, string> = {
    vibrant: "Vivid saturated colors with bold complementary contrast and eye-popping energy",
    sunset: "Warm golden hour amber, crimson red, and deep twilight magenta shadows",
    forest: "Deep emerald greens, warm organic earthy browns, and golden dappled sunlight",
    neon: "Electric pink and cyan neon streaks on a deep obsidian dark background",
    purple: "Royal purple and violet tones with glowing magenta highlights and deep indigo shadows",
    monochrome: "High contrast black and white with dramatic deep shadows and stark highlights",
    ocean: "Deep sapphire blue, bright turquoise, and crisp teal highlights",
    pastel: "Soft dreamy pastel tones with gentle blush pink and mint green highlights",
  };
  const selectedColor = colorMap[options.color_scheme || ""] || analysis.colorDirection;

  // 5. Dynamic Negative Prompt Generation
  let negativePrompt = "";
  if (!analysis.humanRequired) {
    negativePrompt = "No people, no human faces, no women, no men, no models, no portraits, no random characters, no random people, unrelated subject, random woman, random man, random human face, model, portrait, celebrity, unrelated objects, irrelevant objects, generic stock photo, off-topic scene, unnecessary characters, unnecessary people, cluttered composition, weak focal point, tiny main subject, blurry, low quality, distorted anatomy, duplicate objects, extra limbs, malformed hands, watermark, random text, misspelled text, excessive empty space";
  } else {
    negativePrompt = "unrelated subject, random woman, random man, model, portrait, celebrity, unrelated objects, irrelevant objects, generic stock photo, off-topic scene, unnecessary characters, cluttered composition, weak focal point, tiny main subject, blurry, low quality, distorted anatomy, duplicate objects, extra limbs, malformed hands, watermark, random text, misspelled text, excessive empty space";
  }

  // 6. Build Mandated Structured Prompt
  const structuredPromptParts = [
    `Create a professional YouTube thumbnail image specifically about:`,
    `${cleanTopic}`,
    ``,
    `PRIMARY SUBJECT:`,
    `${analysis.primarySubject}`,
    ``,
    `REQUIRED VISUAL ELEMENTS:`,
    analysis.requiredVisualElements.map((item) => `- ${item}`).join("\n"),
    ``,
    `VISUAL STORY:`,
    `${analysis.visualStory}`,
    ``,
    `ENVIRONMENT:`,
    `${analysis.environment}`,
    ``,
    `COMPOSITION:`,
    `${analysis.composition}. The main subject must occupy 40-70% of the visual area and be immediately recognizable at small thumbnail scale.`,
    ``,
    `CAMERA:`,
    `${analysis.cameraView}`,
    ``,
    `LIGHTING:`,
    `${analysis.lighting}`,
    ``,
    `STYLE:`,
    `${selectedStyle}`,
    ``,
    `COLOR DIRECTION:`,
    `${selectedColor}`,
    ``,
    `IMPORTANT:`,
    `The image must clearly communicate ${cleanTopic}.`,
    `The primary subject must be the dominant visual element (occupying 40-70% of the visual frame).`,
    `Every object must be directly relevant to the topic.`,
    `Do not introduce unrelated subjects.`,
    analysis.humanRequired
      ? `Include human presence strictly as specified (${analysis.humanReason || "relevant to topic"}). Do not introduce generic stock models.`
      : `Do NOT add people, women, men, or models under any circumstances.`,
    `Do not create generic stock photography.`,
    `DO NOT render text, letters, or words on the image background. Leave clean negative space for headline text overlays.`,
    ``,
    `NEGATIVE INSTRUCTIONS:`,
    `${negativePrompt}`,
    ``,
    `OUTPUT:`,
    `16:9 YouTube thumbnail composition. High detail. Sharp focal subject. Strong visual hierarchy. Professional commercial quality. Optimized for small-screen viewing.`,
  ];

  return structuredPromptParts.join("\n");
};
