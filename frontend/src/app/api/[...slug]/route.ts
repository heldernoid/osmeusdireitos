import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = (process.env.BACKEND_URL ?? "http://localhost:8005").replace(/\/$/, "");

async function proxy(request: NextRequest, slug: string[]): Promise<NextResponse> {
  const url = `${BACKEND}/api/${slug.join("/")}`;

  const headers: Record<string, string> = {};
  const ct = request.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const res = await fetch(url, {
    method: request.method,
    headers,
    ...(request.method !== "GET" && request.method !== "HEAD"
      ? ({ body: request.body, duplex: "half" } as RequestInit)
      : {}),
  });

  const out = new Headers();
  const outCt = res.headers.get("content-type");
  if (outCt) out.set("content-type", outCt);

  return new NextResponse(res.body, { status: res.status, headers: out });
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxy(request, params.slug);
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxy(request, params.slug);
}
