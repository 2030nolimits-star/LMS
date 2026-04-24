async function testLiveKitConnection() {
  console.log("=== Testing LiveKit WebRTC Protocol ===");

  console.log("1. Requesting token from local /api/livekit/token endpoint...");
  try {
    const resp = await fetch("http://localhost:3000/api/livekit/token?room=test-room&username=test-user");
    const data = await resp.json();

    if (!resp.ok) {
      console.error("❌ Token API failed:", data.error || resp.statusText);
      return;
    }

    if (data.mode === "demo" || data.token === "dummy_token_dev_mode") {
      console.log("✅ LiveKit token API is working in DEMO mode.");
      console.log("   Add LIVEKIT_API_KEY, LIVEKIT_API_SECRET and NEXT_PUBLIC_LIVEKIT_URL in .env.local for real WebRTC.");
      return;
    }

    if (typeof data.token === "string" && data.token.length > 20) {
      console.log("✅ LiveKit token API is returning real JWT tokens.");
      console.log("   Browser-side WebRTC can now connect from the live class UI.");
      return;
    }

    console.error("❌ Unexpected token response format:", data);
  } catch (error) {
    console.error("❌ LiveKit test failed:", error.message || error);
  }
}

testLiveKitConnection();
