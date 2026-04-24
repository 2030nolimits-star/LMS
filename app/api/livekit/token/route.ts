import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");

  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    // If running in development without keys, return a dummy token so the UI doesn't crash
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        token: "dummy_token_dev_mode",
        mode: "demo",
        message: "LiveKit credentials not configured. Running classroom in demo mode.",
      });
    }
    return NextResponse.json(
      { error: "Server misconfigured: LiveKit keys missing" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  });

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return NextResponse.json({ token: await at.toJwt() });
}
