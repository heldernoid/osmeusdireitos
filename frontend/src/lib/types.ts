export type Language = "pt" | "emk" | "cha" | "sen";
export type Severity = "low" | "medium" | "high";

export interface QueryRequest {
  situation: string;
  language: Language;
}

export interface ArticleCited {
  number: number;
  source?: string;
  title: string;
  excerpt: string;
  relevance: string;
}

export interface QueryResponse {
  query_id: string;
  violated: boolean;
  severity: Severity;
  verdict_summary: string;
  articles_cited: ArticleCited[];
  explanation: string;
  next_steps: string[];
}

export type PhaseStatus = "pending" | "running" | "done" | "failed";

export interface StreamEvent {
  phase: "classify" | "retrieve" | "analyze";
  status: PhaseStatus;
  message?: string;
  result?: QueryResponse;
}

export interface FeedbackRequest {
  query_id: string;
  helpful: boolean;
  comment?: string;
}

export interface FeedbackResponse {
  status: string;
}

export interface HealthResponse {
  status: string;
  index_ready: boolean;
  article_count: number;
  version: string;
}

export interface ExampleSituation {
  id: number;
  text: string;
  category: string;
}

export interface ExamplesResponse {
  examples: ExampleSituation[];
}
