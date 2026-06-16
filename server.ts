import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: "/api/live" });

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the Secrets panel of Google AI Studio.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory mock storage for simplicity and persistence in session
interface AgentSession {
  identity: {
    name: string;
    role: string;
    publicKey: string;
    privateKeySim: string;
    avatar: string;
    budget: number; // in CSPR
    spendingPolicy: {
      dailyLimitCspr: number;
      gasPolicyCspr: number;
      riskAllowance: string;
      allowedSmartContracts: string[];
    };
  };
  marketAgents: Array<{
    name: string;
    role: string;
    creatorsCount: number;
    microFeeCspr: number;
    description: string;
    creatorRewardPerc: number;
  }>;
  publishedAgents: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
    microFeeCspr: number;
    revenueEarnedCspr: number;
    creator: string;
  }>;
  nfts: Array<{
    id: string;
    tokenName: string;
    symbol: string;
    image: string;
    strategyHash: string;
    narrative: string;
    apy: string;
    timestamp: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amountCspr: number;
    recipient: string;
    status: string;
    timestamp: string;
    hash: string;
  }>;
}

let sessionStore: AgentSession = {
  identity: {
    name: "CFO-Velo-Alpha",
    role: "Autonomous Corporate Treasurer & DeFi Allocator",
    publicKey: "010a30b6528d22de260af3530c33a92b2d07525367623a89ee16f6b281f2dfbe02",
    privateKeySim: "ed25519_sk_863dbfe6bceea4fb92d338f...",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
    budget: 850.0,
    spendingPolicy: {
      dailyLimitCspr: 150,
      gasPolicyCspr: 15,
      riskAllowance: "Low to Moderate",
      allowedSmartContracts: ["Casper-Lend-v2", "CSPR-AFT-Bridge", "Velo-Staking-Pool"],
    },
  },
  marketAgents: [
    { name: "Alpha Research Hub", role: "Search & Market Intelligence", creatorsCount: 8, microFeeCspr: 5.0, description: "Extracts premium on-chain movements and yield updates.", creatorRewardPerc: 80 },
    { name: "RiskSentinel", role: "Risk Scrubber & Audit", creatorsCount: 14, microFeeCspr: 3.5, description: "Validates security rating profiles and contract code safety.", creatorRewardPerc: 80 },
    { name: "Satori Optimizers", role: "Yield Arbitrage Scout", creatorsCount: 4, microFeeCspr: 8.0, description: "Discovers and negotiates cross-pool yields on Casper.", creatorRewardPerc: 85 },
  ],
  publishedAgents: [
    {
      id: "agent_startup_sig",
      name: "Startup Pitch Filter",
      role: "Corporate Vetting",
      description: "Analyzes early startup funding signals and corporate health.",
      microFeeCspr: 12.0,
      revenueEarnedCspr: 144.0,
      creator: "contactauxlo@gmail.com",
    },
  ],
  nfts: [
    {
      id: "VMEM-803C",
      tokenName: "Velo Agent Strategy #104",
      symbol: "VMEM",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80",
      strategyHash: "0xb79c66a4f7e5b512e0e47012903fb8f1e6378e9f8ec7559ed183d3ff6db0f93a",
      narrative: "Low-risk USDC allocation into Casper-Lend staking pool yielding 8.42% APY with on-chain hedge setup.",
      apy: "8.42%",
      timestamp: "2026-06-12 14:22:01",
    },
  ],
  transactions: [
    {
      id: "TX-40291",
      type: "x402 Paid Data Purchase",
      amountCspr: 4.5,
      recipient: "CryptoQuant Premium Feed",
      status: "Finalized",
      timestamp: "2026-06-15 10:11:32",
      hash: "0x34fbc871aade35...bc34",
    },
    {
      id: "TX-40292",
      type: "Yield Strat Execution",
      amountCspr: 100.0,
      recipient: "Casper-Lend-v2 Contract",
      status: "Finalized",
      timestamp: "2026-06-15 11:15:00",
      hash: "0x890fac7223bfe4...eeae",
    },
  ],
};

// RESET SESSION (For user testing)
app.post("/api/session/reset", (req, res) => {
  sessionStore = {
    identity: {
      name: "CFO-Velo-Alpha",
      role: "Autonomous Corporate Treasurer & DeFi Allocator",
      publicKey: "010a30b6528d22de260af3530c33a92b2d07525367623a89ee16f6b281f2dfbe02",
      privateKeySim: "ed25519_sk_863dbfe6bceea4fb92d338f...",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
      budget: 850.0,
      spendingPolicy: {
        dailyLimitCspr: 150,
        gasPolicyCspr: 15,
        riskAllowance: "Low to Moderate",
        allowedSmartContracts: ["Casper-Lend-v2", "CSPR-AFT-Bridge", "Velo-Staking-Pool"],
      },
    },
    marketAgents: [
      { name: "Alpha Research Hub", role: "Search & Market Intelligence", creatorsCount: 8, microFeeCspr: 5.0, description: "Extracts premium on-chain movements and yield updates.", creatorRewardPerc: 80 },
      { name: "RiskSentinel", role: "Risk Scrubber & Audit", creatorsCount: 14, microFeeCspr: 3.5, description: "Validates security rating profiles and contract code safety.", creatorRewardPerc: 80 },
      { name: "Satori Optimizers", role: "Yield Arbitrage Scout", creatorsCount: 4, microFeeCspr: 8.0, description: "Discovers and negotiates cross-pool yields on Casper.", creatorRewardPerc: 85 },
    ],
    publishedAgents: [
      {
        id: "agent_startup_sig",
        name: "Startup Pitch Filter",
        role: "Corporate Vetting",
        description: "Analyzes early startup funding signals and corporate health.",
        microFeeCspr: 12.0,
        revenueEarnedCspr: 144.0,
        creator: "contactauxlo@gmail.com",
      },
    ],
    nfts: [
      {
        id: "VMEM-803C",
        tokenName: "Velo Agent Strategy #104",
        symbol: "VMEM",
        image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80",
        strategyHash: "0xb79c66a4f7e5b512e0e47012903fb8f1e6378e9f8ec7559ed183d3ff6db0f93a",
        narrative: "Low-risk USDC allocation into Casper-Lend staking pool yielding 8.42% APY with on-chain hedge setup.",
        apy: "8.42%",
        timestamp: "2026-06-12 14:22:01",
      },
    ],
    transactions: [
      {
        id: "TX-40291",
        type: "x402 Paid Data Purchase",
        amountCspr: 4.5,
        recipient: "CryptoQuant Premium Feed",
        status: "Finalized",
        timestamp: "2026-06-15 10:11:32",
        hash: "0x34fbc871aade35...bc34",
      },
      {
        id: "TX-40292",
        type: "Yield Strat Execution",
        amountCspr: 100.0,
        recipient: "Casper-Lend-v2 Contract",
        status: "Finalized",
        timestamp: "2026-06-15 11:15:00",
        hash: "0x890fac7223bfe4...eeae",
      },
    ],
  };
  res.json({ success: true, message: "Session reset successfully", session: sessionStore });
});

// GET CURRENT SESSION
app.get("/api/session", (req, res) => {
  res.json(sessionStore);
});

// UPDATE AGENT CONFIG / POLICIES
app.post("/api/agent/update", (req, res) => {
  const { name, budget, dailyLimitCspr, gasPolicyCspr, riskAllowance, allowedSmartContracts } = req.body;
  if (name) sessionStore.identity.name = name;
  if (budget !== undefined) sessionStore.identity.budget = Number(budget);
  if (dailyLimitCspr !== undefined) sessionStore.identity.spendingPolicy.dailyLimitCspr = Number(dailyLimitCspr);
  if (gasPolicyCspr !== undefined) sessionStore.identity.spendingPolicy.gasPolicyCspr = Number(gasPolicyCspr);
  if (riskAllowance) sessionStore.identity.spendingPolicy.riskAllowance = riskAllowance;
  if (allowedSmartContracts) sessionStore.identity.spendingPolicy.allowedSmartContracts = allowedSmartContracts;

  res.json({ success: true, session: sessionStore });
});

// PUBLISH A CUSTOM REVENUE-GENERATING AGENT
app.post("/api/agent/publish", (req, res) => {
  const { name, role, description, microFeeCspr, creator } = req.body;
  if (!name || !role || !description) {
    return res.status(400).json({ error: "Missing required fields for custom agent publication" });
  }

  const newAgent = {
    id: "agent_" + Date.now(),
    name,
    role,
    description,
    microFeeCspr: Number(microFeeCspr) || 5.0,
    revenueEarnedCspr: 0,
    creator: creator || "Anonymous Creator",
  };

  sessionStore.publishedAgents.push(newAgent);
  res.json({ success: true, agent: newAgent, session: sessionStore });
});

// TRIGGER SIMULATED REVENUE QUERY (Mock market query to earn CSPR)
app.post("/api/agent/simulate-market-hire", (req, res) => {
  const { agentId } = req.body;
  const agent = sessionStore.publishedAgents.find((a) => a.id === agentId);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  const queryEarned = agent.microFeeCspr;
  agent.revenueEarnedCspr += queryEarned;

  // Split calculations
  const creatorPayout = Number((queryEarned * 0.8).toFixed(2));
  const infraPayout = Number((queryEarned * 0.15).toFixed(2));
  const protocolPayout = Number((queryEarned * 0.05).toFixed(2));

  // Update budget of Velo Agent representing on-chain business assets
  sessionStore.identity.budget += creatorPayout;

  // Record Transaction
  const txId = "TX-" + Math.floor(10000 + Math.random() * 90000);
  sessionStore.transactions.unshift({
    id: txId,
    type: `Inbound Agent Query (${agent.name})`,
    amountCspr: queryEarned,
    recipient: "Velo Treasury Escrow",
    status: "Finalized",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
  });

  res.json({
    success: true,
    message: "A micro-transaction transaction occurred! Revenue distributed.",
    queryEarned,
    splits: { creatorPayout, infraPayout, protocolPayout },
    session: sessionStore,
  });
});

// CORE ACTION: AUTONOMOUS INTERACT ROUTE (USING SERVER-SIDE GEMINI!)
app.post("/api/agent/interact", async (req, res) => {
  const { prompt, riskAllowance } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Instruction prompt cannot be empty" });
  }

  const chosenRisk = riskAllowance || sessionStore.identity.spendingPolicy.riskAllowance;

  try {
    const ai = getGeminiClient();

    // Custom system instructions explaining x402, paid datasets, multi-agent hires, Casper chain and ROI
    const systemPrompt = `
      You are the backend strategist and multi-agent orchestator for "Velo Agent" - a Casper on-chain Autonomous AI CFO.
      The user is asking you for a business optimization, DeFi yield allocation strategy, or corporate finance transaction.
      The user task is: "${prompt}" with risk category: "${chosenRisk}".

      As Velo Agent, you must coordinate a multi-agent workforce and demonstrate:
      1. Autonomous Data Purchases: You search and identify premium data feeds relevant to this task (e.g., specific DeFi feeds like 'Casper Analytics Pro', 'USDC Premium Oracle', 'Dune Yield Engine').
      2. M2M (Machine-to-Machine) x402 negotiation: You must show a short negotiation dialogue where you buy access to this data. For example, the provider asks for 10 CSPR, your agent bids 4 CSPR, and you close at exactly 4.5 CSPR.
      3. Multi-Agent marketplace hiring: Your research agent hires a risk auditor or execution specialist (another specialized agent) and pays them a micro-fee.
      4. AI Investment Committee Debate: Play the role of three or four distinct agents with strong financial roles debating this transaction:
         - Bull Agent: Focuses on maximizing APR, bullish signals, scale, and high yield potentials.
         - Bear Agent: Defensive, skeptical, looks for impermanent loss, liquidity cliffs, and counterparty risks.
         - Risk Agent: Rigorous safety auditing of smart contract code, historical exploits, standard compliance, and Casper gas constraints.
         - Macro Agent: Analyzes broader crypto flows, Casper chain transaction speed, and gas pricing.
         Make them participate in a sharp, realistic, highly intelligent debate.
      5. Consensus outcome & Casper Smart Contract specifications: Develop a concrete smart contract call with a specific entrypoint, gas limit, and exact pool to target that matches the consensus strategy.
      6. Verifiable Memory NFT: Design a memorable "NFT Strategy Receipt" representing this executed logic.

      You MUST respond with a JSON object strictly matching this schema:
      {
        "agentIdentityUpgraded": {
          "status": "success",
          "actionTaken": "Discovered target transaction parameters and allocated dedicated on-chain vault key setup."
        },
        "dataFeedsPurchased": [
          {
            "feedName": "Name of premium source",
            "provider": "Provider address or entity",
            "initialPriceCspr": 8.0,
            "negotiatedPriceCspr": 4.5,
            "negotiationTranscript": [
              { "speaker": "CFO Velo Agent", "message": "Offer message..." },
              { "speaker": "Provider API Engine", "message": "Reply message..." }
            ],
            "dataFetched": "Short paragraph of high-value analysis retrieved in the premium data feed."
          }
        ],
        "multiAgentDeals": [
          {
            "fromAgent": "Specialized Agent A (e.g. Research)",
            "toAgent": "Specialized Agent B (e.g. Auditor)",
            "action": "Task hired",
            "paymentCspr": 2.5
          }
        ],
        "committeeDebate": [
          { "speaker": "Bull Agent", "stance": "Bullish", "argument": "Detailed smart arguments..." },
          { "speaker": "Bear Agent", "stance": "Bearish / Skeptical", "argument": "Alternative threats argued..." },
          { "speaker": "Risk Agent", "stance": "Analytical Safeguards", "argument": "Auditing and hedge details..." },
          { "speaker": "Macro Agent", "stance": "Strategic Position", "argument": "Casper ecosystem macro factors..." }
        ],
        "consensusScore": 88,
        "finalDecision": {
          "yieldStrategy": "Clear title of strategy, e.g. Stake USDC on Casper-Lend-v2 Contract",
          "estimatedApy": "APRs or Yield % e.g. 9.15%",
          "riskRating": "Low" | "Medium" | "High",
          "casperContractDetails": {
            "entrypoint": "stake_assets or standard entrypoint",
            "gasLimitCspr": 15,
            "amountCspr": 100,
            "args": "Hex parameters/runtime args"
          }
        },
        "nftMemory": {
          "tokenName": "e.g. Casper Yield Proof #105",
          "symbol": "CPRO",
          "strategyHash": "A realistic 64-char transaction hash representing immutable log on Casper",
          "narrative": "A concise executive summary of the committee decision for NFT rendering."
        }
      }

      Return ONLY valid JSON. Absolutely no markdown wrappers like \`\`\`json. Keep it concise but smart. Use realistic references to the Casper Network, its high performance, stable gas prices, and financial contracts.
    `;

    // Use a high-performance Gemini model for complex financial reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text ? response.text.trim() : "{}";
    let strategyResult;
    try {
      strategyResult = JSON.parse(outputText);
    } catch (parseErr) {
      console.warn("JSON parsing failed, raw fallback applied", outputText);
      // Clean up markdown wrappers in case model disobeyed
      const cleaned = outputText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
      strategyResult = JSON.parse(cleaned);
    }

    // Apply the strategy's micro-costs to our budget
    let totalSpent = 0;
    if (strategyResult.dataFeedsPurchased) {
      strategyResult.dataFeedsPurchased.forEach((feed: any) => {
        totalSpent += feed.negotiatedPriceCspr || 0;
      });
    }
    if (strategyResult.multiAgentDeals) {
      strategyResult.multiAgentDeals.forEach((deal: any) => {
        totalSpent += deal.paymentCspr || 0;
      });
    }
    const contractCommitCspr = strategyResult?.finalDecision?.casperContractDetails?.amountCspr || 50;
    totalSpent += contractCommitCspr;

    if (sessionStore.identity.budget >= totalSpent) {
      sessionStore.identity.budget -= Number(totalSpent.toFixed(2));
    } else {
      // Allow simulation even if over budget, but warn
      sessionStore.identity.budget = Math.max(0, sessionStore.identity.budget - 12);
    }

    // Insert simulated transaction logs
    if (strategyResult.dataFeedsPurchased) {
      strategyResult.dataFeedsPurchased.forEach((feed: any) => {
        sessionStore.transactions.unshift({
          id: "TX-" + Math.floor(10000 + Math.random() * 90000),
          type: "x402 Data Purchase (" + feed.feedName + ")",
          amountCspr: feed.negotiatedPriceCspr || 4.5,
          recipient: feed.provider || "Premium Oracle",
          status: "Finalized",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        });
      });
    }

    const mainTxId = "TX-" + Math.floor(10000 + Math.random() * 90000);
    const mainTxHash = strategyResult?.nftMemory?.strategyHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    sessionStore.transactions.unshift({
      id: mainTxId,
      type: "Yield Strat Execution",
      amountCspr: contractCommitCspr,
      recipient: strategyResult?.finalDecision?.yieldStrategy || "Defi Allocator",
      status: "Finalized",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      hash: mainTxHash,
    });

    // Mint NFT to memory vault
    const nftImagesFallback = [
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=300&q=80",
    ];
    const chosenNftImage = nftImagesFallback[Math.floor(Math.random() * nftImagesFallback.length)];

    const mintedNft = {
      id: "VMEM-" + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase(),
      tokenName: strategyResult?.nftMemory?.tokenName || "Casper Rep Vault Proof",
      symbol: strategyResult?.nftMemory?.symbol || "VMEM",
      image: chosenNftImage,
      strategyHash: mainTxHash,
      narrative: strategyResult?.nftMemory?.narrative || "Autonomous yield allocation verified and signed on Casper.",
      apy: strategyResult?.finalDecision?.estimatedApy || "9.0%",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    sessionStore.nfts.unshift(mintedNft);

    res.json({
      success: true,
      result: strategyResult,
      mintedNft,
      session: sessionStore,
    });
  } catch (error: any) {
    console.error("Gemini interact error:", error);
    res.status(500).json({
      error: error.message || "Unknown error occurred on Velo corporate intelligence server.",
      isSimulationFallbackNeeded: true,
    });
  }
});

// Gemini Live API WebSocket Bridge
wss.on("connection", async (clientWs) => {
  console.log("[Velo Live] Client connected for voice session");
  let session: any = null;

  clientWs.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "start") {
        const ai = getGeminiClient();
        session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
            },
            systemInstruction: "You are the Velo Agent voice engine. You assist users with autonomous CFO tasks on the Casper network. Speak clearly and professionally.",
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ type: "audio", data: audio }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }
            },
          },
        });
        console.log("[Velo Live] Gemini session connected");
      } else if (msg.type === "audio" && session) {
        session.sendRealtimeInput({
          audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" },
        });
      }
    } catch (err) {
      console.error("[Velo Live] WebSocket error:", err);
    }
  });

  clientWs.on("close", () => {
    if (session) {
      session.close();
      console.log("[Velo Live] session closed");
    }
  });
});

// Vercel Serverless Function Wrapper Check
if (process.env.NODE_ENV !== "production") {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Velo Server] Development server running on http://localhost:${PORT}`);
  });
} else {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Velo Server] Production container engine running on port ${PORT}`);
  });
}

// Integrated Vite Dev Middleware
const setupVite = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
};

setupVite();

export default app;
