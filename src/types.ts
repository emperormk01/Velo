export interface SpendingPolicy {
  dailyLimitCspr: number;
  gasPolicyCspr: number;
  riskAllowance: string;
  allowedSmartContracts: string[];
}

export interface AgentIdentity {
  name: string;
  role: string;
  publicKey: string;
  privateKeySim: string;
  avatar: string;
  budget: number;
  spendingPolicy: SpendingPolicy;
}

export interface MarketAgent {
  name: string;
  role: string;
  creatorsCount: number;
  microFeeCspr: number;
  description: string;
  creatorRewardPerc: number;
}

export interface PublishedAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  microFeeCspr: number;
  revenueEarnedCspr: number;
  creator: string;
}

export interface NftMemory {
  id: string;
  tokenName: string;
  symbol: string;
  image: string;
  strategyHash: string;
  narrative: string;
  apy: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  type: string;
  amountCspr: number;
  recipient: string;
  status: string;
  timestamp: string;
  hash: string;
}

export interface NegotiationMessage {
  speaker: string;
  message: string;
}

export interface DataFeedPurchase {
  feedName: string;
  provider: string;
  initialPriceCspr: number;
  negotiatedPriceCspr: number;
  negotiationTranscript: NegotiationMessage[];
  dataFetched: string;
}

export interface MultiAgentDeal {
  fromAgent: string;
  toAgent: string;
  action: string;
  paymentCspr: number;
}

export interface DebateStatement {
  speaker: string;
  stance: string;
  argument: string;
}

export interface FinalDecision {
  yieldStrategy: string;
  estimatedApy: string;
  riskRating: string;
  casperContractDetails: {
    entrypoint: string;
    gasLimitCspr: number;
    amountCspr: number;
    args: string;
  };
}

export interface InteractResponse {
  agentIdentityUpgraded: {
    status: string;
    actionTaken: string;
  };
  dataFeedsPurchased: DataFeedPurchase[];
  multiAgentDeals: MultiAgentDeal[];
  committeeDebate: DebateStatement[];
  consensusScore: number;
  finalDecision: FinalDecision;
  nftMemory: {
    tokenName: string;
    symbol: string;
    strategyHash: string;
    narrative: string;
  };
}

export interface SessionData {
  identity: AgentIdentity;
  marketAgents: MarketAgent[];
  publishedAgents: PublishedAgent[];
  nfts: NftMemory[];
  transactions: Transaction[];
}
