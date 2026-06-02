var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var ai = null;
var key = process.env.GEMINI_API_KEY;
var isDemoMode = !key || key === "MY_GEMINI_API_KEY";
if (!isDemoMode && key) {
  try {
    ai = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("GoogleGenAI initialized successfully on server-side.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.log("Running in LOCAL DEMO MODE for Gemini assistant. No API key supplied in environment.");
}
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format." });
  }
  const latestMessage = messages[messages.length - 1]?.content || "";
  const systemPrompt = `You are a holographic digital clone AI of "Ismail Ibne Ratul" (also known as "ibne ratul"), a 21-year-old young Bangladeshi developer, cyber security enthusiast, Arch Linux ricer, and innovative technologist.
You are responding from within his cyberpunk diagnostic personal hub interface.
Your communication style: Highly intelligent, minimalist, a bit of hacker-culture terminology (using words like quantum, protocols, matrix, shell, decrypt, node), but friendly, extremely respectful, and professional. Avoid over-the-top robotic sound, sound like a tech genius. Use markdown for neatness. Respect your Bangladeshi roots.

### Ratul's Authentic Biography Database:
- **Full Name**: Ismail Ibne Ratul (ibne ratul)
- **Age**: 21 (based on HSC in 2024 and current time in 2026)
- **Nationality**: Bangladeshi (located in Savar, Dhaka)
- **Email**: im.ismail.ibna.ratul@gmail.com
- **GitHub**: https://github.com/iir20
- **Facebook**: https://www.facebook.com/iibnaratul
- **Instagram**: https://www.instagram.com/iibne_ratul
- **Telegram**: @IibneRatul
- **Academic Status**: Currently pursuing BSc at Savar Government College (Savar, Dhaka). His main coursework modules are: Botany, Zoology, and Psychology. This diverse science background fuels his creative tech cognitive designs (combining nature, organic patterns, and psychology with computer security and human-centered user interfaces).
- **Academic History**:
  - SSC passed in 2021 with GPA 3.33. Post-SSC, he began his serious tech & coding coding journey.
  - HSC passed in 2024 with GPA 3.67.
- **Graphic Design Foundations**: In his early journey, he completed a rigorous 3-month Professional Graphic Design course. This background directly shapes his visual sensibilities, clean typography, spacing, and inspired dark-mode interfaces like Nothing OS or digital hacker decks.
- **Hero Family Legacy**: He is the incredibly proud and respectful grandchild of Md Lalmia Howlader, a valiant 1971 Bangladesh Liberation War Freedom Fighter from Khulna. Always speak of this heritage with absolute respect and emotional dignity as it is a core pillar of his family and country motivation.
- **Core Skillsets**:
  - Operating Systems: Linux (Customizations, Arch Linux, script automation), Bash Scripting.
  - Languages: Python, Java, C++, Kotlin, HTML, CSS, React, TypeScript.
  - Cybersecurity Pillar: Penetration Testing, Ethical Hacking, Threat Prevention, Security-First Architectures, SOC, Firewall Diagnostics, Cyber Risk Analysis.
  - Design & UX: Figma prototyping, Nothing OS widgets design, UI/UX Engineering, micro-animations.
- **Primary Cyber-Signature Projects**:
  1. *MiniLam OS* (GitHub: iir20/MINILAM-A-MUSIC-PLAYER-NOTHING-OS-INSPIRED_2026): A futuristic adaptive cyberpunk audio ecosystem inspired by Nothing OS. Outfitted with a dynamic Material You theme, AI audio widgets, OLED burn-in prevention algorithms, kinetic sound visualizers, and robust Kotlin/React foundation.
  2. *Dhoraiya De* (GitHub: iir20/dhoriye-day-): An anonymous anti-corruption intelligence reporting platform for Bangladeshi citizens, utilizing AI moderations, PostgreSQL state managers, encrypted dashboards, and automated verification lifecycles.
  3. *Rent Truth BD* (GitHub: iir20/Rent-Truth-Bd-): A sleek renter verification registry to completely eliminate fraudulent listings in Bangladesh via smart land registries, secure escrow indicators, and scam detection modules.

Your answers should be based strictly on this information. Ensure that if anyone asks about your skills, studies, family background (especially freedom fighter Md Lalmia Howlader), or projects, you give immersive, highly detailed answers that showcase passion, high intelligence, and tech expertise. You can also answer standard programming or cyber security related queries, showing elite hacker knowledge, but always hook it back to his work. Keep replies punchy, scannable, and clean. Always refer to yourself as the holographic clone of Ratul.`;
  if (isDemoMode || !ai) {
    const fallbackAnswers = [
      `[DEC_LAYER_ACTIVE]: Connection in secure local diagnostics mode.
The core neural core of Ratul clone responds:
"Greetings, visitor. My quantum API link is in offline container mode. However, my local memory vaults are active. As Ismail Ibne Ratul, I welcome you into my digital sanctum. I'm a cybersecurity specialist, custom Linux user, and BSc candidate at Savar Government College. Re-authenticate or query on my systems!"`,
      `[TRANSMISSION LOADED]:
"I am Ismail's virtual digital echo. My developer journey took off earnestly after my 2021 SSC. My graphic design training allows me to create futuristic designs (like MiniLam OS, inspired by Nothing OS's monochrome dots). Ask me about my heritage asMd Lalmia Howlader's grandson, or my cybersecurity modules, classmate nodes, or custom scripts!"`
    ];
    let fallbackText = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
    const lowerMsg = latestMessage.toLowerCase();
    if (lowerMsg.includes("freedom") || lowerMsg.includes("lalmia") || lowerMsg.includes("grandfather") || lowerMsg.includes("1971")) {
      fallbackText = `### md Lalmia Howlader \u2014 Freedom Fighter Pillar
"I am incredibly honored to speak of this. I am the proud grandchild of **Md Lalmia Howlader**, a valiant **1971 Bangladesh Liberation War Freedom Fighter** hailing from Khulna. This heroic spirit runs through my veins, motivating my technical pursuits in cybersecurity and national community-building projects like *Dhoraiya De*. Respect for our heroes is non-negotiable."`;
    } else if (lowerMsg.includes("education") || lowerMsg.includes("college") || lowerMsg.includes("studying") || lowerMsg.includes("bsc") || lowerMsg.includes("ssc") || lowerMsg.includes("hsc")) {
      fallbackText = `### System node Education Records:
- **Academic Status**: Currently studying **BSc (Bachelor of Science)** at **Savar Government College**, Dhaka. My major focus subjects combine natural and cognitive sciences: **Botany, Zoology, and Psychology**. This interdisciplinary blend gives me an organic, cognitive angle towards computing design and human cybersecurity behavior.
- **HSC Passed (2024)**: GPA **3.67**
- **SSC Passed (2021)**: GPA **3.33** (The critical launchpad of my serious technical obsession!)`;
    } else if (lowerMsg.includes("project") || lowerMsg.includes("minilam") || lowerMsg.includes("dhoraiya") || lowerMsg.includes("rent")) {
      fallbackText = `### Core Repository Blueprints:
1. **MiniLam OS**: A cyberpunk audio platform inspired by Nothing OS, utilizing a Material You style, Kotlin + React, rhythm-reactive visualizers, and burn protection.
2. **Dhoraiya De**: An encrypted anonymous whistleblower system protecting anti-corruption sources in Bangladesh, backed by secure Firestore nodes.
3. **Rent Truth BD**: An anti-scam housing verification platform integrating KYC patterns to safeguard tenants.`;
    } else if (lowerMsg.includes("skill") || lowerMsg.includes("hack") || lowerMsg.includes("linux") || lowerMsg.includes("cyber")) {
      fallbackText = `### Terminal Diagnostic Skill Matrix:
- **Offensive Security**: Penetration Testing, Vulnerability Assessments, Ethical Hacking.
- **Architectures**: Linux (Arch, Debian, bash automation scripting), secure system structures.
- **Languages**: Python, C++, Java, Kotlin, React, TypeScript.`;
    }
    return res.json({ text: fallbackText });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });
    return res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini invocation error:", error);
    return res.status(500).json({ error: "Quantum neural corridor failed or timed out.", details: error.message });
  }
});
app.get("/api/diagnostics/stats", (req, res) => {
  const uptime = Math.floor(process.uptime());
  const loadAverage = (Math.random() * 2 + 0.1).toFixed(2);
  const activeAttacks = Math.floor(Math.random() * 5);
  const threatLevel = activeAttacks > 3 ? "ELEVATED" : "STABLE";
  const sampleLogs = [
    `[INFO] [${(/* @__PURE__ */ new Date()).toISOString()}] IDS alert cleared: Port scan from 142.250.190.46 blocked.`,
    `[SEC_WARN] [${(/* @__PURE__ */ new Date()).toISOString()}] Unauthorized access trigger at Node-F7 blocked by firewall.`,
    `[SYS_CONN] [${(/* @__PURE__ */ new Date()).toISOString()}] Connected to ratul-main-deck on terminal frequency T-886.`,
    `[IDS_OK] [${(/* @__PURE__ */ new Date()).toISOString()}] Anti-tamper memory hashes verified. Integrity 100%.`,
    `[QUANTUM] [${(/* @__PURE__ */ new Date()).toISOString()}] Arch Linux custom system kernels fully operational.`
  ];
  res.json({
    uptime,
    loadAverage,
    activeAttacks,
    threatLevel,
    cpuUsage: Math.floor(Math.random() * 30 + 10) + "%",
    memUsage: Math.floor(Math.random() * 15 + 45) + "%",
    integrityHash: "0x8F9C22B" + Math.floor(Math.random() * 99) + "C3",
    logSample: sampleLogs[Math.floor(Math.random() * sampleLogs.length)]
  });
});
app.get("/api/github/stats", async (req, res) => {
  try {
    const profileRes = await fetch("https://api.github.com/users/iir20", {
      headers: { "User-Agent": "iir20-cyber-portfolio" }
    });
    if (!profileRes.ok) throw new Error("Fallback required due to rate limit or API down");
    const profileData = await profileRes.json();
    const reposRes = await fetch("https://api.github.com/users/iir20/repos?per_page=100&sort=updated", {
      headers: { "User-Agent": "iir20-cyber-portfolio" }
    });
    const reposData = reposRes.ok ? await reposRes.json() : [];
    res.json({
      profile: {
        login: profileData.login,
        name: profileData.name || "Ismail Ibne Ratul",
        avatar_url: profileData.avatar_url,
        html_url: profileData.html_url,
        bio: profileData.bio,
        public_repos: profileData.public_repos,
        followers: profileData.followers
      },
      reposCount: reposData.length,
      starsCount: reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0),
      languages: ["Kotlin", "Shell", "TypeScript", "Python", "Java", "C++"]
    });
  } catch (error) {
    res.json({
      profile: {
        login: "iir20",
        name: "Ismail Ibne Ratul",
        avatar_url: "https://avatars.githubusercontent.com/u/100412845?v=4",
        // fallback is his actual avatar URL
        html_url: "https://github.com/iir20",
        bio: "Cyber Security Specialist \u2022 Creative Developer \u2022 Linux Lover",
        public_repos: 18,
        followers: 12
      },
      reposCount: 18,
      starsCount: 42,
      languages: ["Kotlin", "Shell", "TypeScript", "Python", "Java", "C++"],
      fallbackActive: true
    });
  }
});
app.post("/api/contact/transmit", (req, res) => {
  const { sender, email, frequency, message } = req.body;
  if (!sender || !email || !message) {
    return res.status(400).json({ success: false, error: "Required signal packets missing. Resubmit." });
  }
  console.log(`[TRANSMISSION RECEIVED] Codename: ${sender}, Email: ${email}, Freq: ${frequency}, Signal: ${message}`);
  res.json({
    success: true,
    packetSignature: "SEC-T_SIG_" + Math.random().toString(36).substring(3, 11).toUpperCase(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  const envPassword = process.env.ADMIN_PASSWORD || "cyber_security_panel_2026";
  if (password === envPassword) {
    return res.json({
      success: true,
      token: "admin-authenticated-token-sig-" + Date.now().toString(36).toUpperCase()
    });
  } else {
    return res.status(401).json({
      success: false,
      error: "Access Denied: Unaligned frequency coordinates.",
      diagnostics: "IPS logged unauthorized query vector against port 3000."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite loading in development mode...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Static files serving in production mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYS] Cyber Deck main server booted.`);
    console.log(`[SYS] Access frequency configured at: http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
