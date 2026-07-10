import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb/client";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  const data = await searchMovies(query);
  return NextResponse.json(data);
}
