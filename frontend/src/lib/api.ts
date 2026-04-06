import type {
  ExamplesResponse,
  FeedbackRequest,
  FeedbackResponse,
  HealthResponse,
  QueryRequest,
  QueryResponse,
  StreamEvent,
} from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health");
  },

  query(body: QueryRequest): Promise<QueryResponse> {
    return request<QueryResponse>("/api/query", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  feedback(body: FeedbackRequest): Promise<FeedbackResponse> {
    return request<FeedbackResponse>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  examples(): Promise<ExamplesResponse> {
    return request<ExamplesResponse>("/api/examples");
  },

  async queryStream(
    body: QueryRequest,
    onEvent: (event: StreamEvent) => void,
  ): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
      throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          onEvent(JSON.parse(trimmed) as StreamEvent);
        } catch {
          // skip malformed lines
        }
      }
    }
  },
};
