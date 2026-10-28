import { getCurrentUser } from "@/api/auth.api";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.redirect("/login");
  }

  const currentUser = await getCurrentUser();
}
