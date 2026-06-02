export interface Project {
  id: string;
  title: string;
  description: string;
  github: string;
  features: string[];
  tags: string[];
  demoVisualType: "music" | "intel" | "rent";
  repositoryStats: {
    commits: number;
    stars: number;
    forks: number;
    testCoverage: string;
  };
}

export interface Skill {
  name: string;
  level: number;
  category: "Language" | "Cyber Security" | "Systems & OS" | "Design & UX";
  status: "SECURED" | "ACTIVE" | "INTEGRATED";
  metrics: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL" | "SUCCESS";
  node: string;
  message: string;
}

export interface SOCStats {
  uptime: number;
  loadAverage: string;
  activeAttacks: number;
  threatLevel: "STABLE" | "ELEVATED" | "CRITICAL";
  cpuUsage: string;
  memUsage: string;
  integrityHash: string;
  logSample: string;
}
