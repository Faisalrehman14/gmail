import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.status);
  }
  console.error("API Error:", error);
  const message =
    error instanceof Error ? error.message : "Internal server error";
  return apiError(message, 500);
}
