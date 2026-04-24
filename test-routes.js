async function testRoutes() {
  const baseUrl = "http://localhost:3000";
  const routes = [
    "/",
    "/login",
    "/register",
    "/dashboard/student",
    "/dashboard/teacher",
    "/dashboard/admin",
    "/api/livekit/token?room=test&username=test"
  ];

  console.log("=== Testing Next.js Routes ===");
  
  for (const route of routes) {
    try {
      const res = await fetch(baseUrl + route);
      console.log(`[${res.status}] ${route}`);
      if (res.status === 500) {
        const text = await res.text();
        console.error(`Error on ${route}: ${text.substring(0, 200)}`);
      }
    } catch (e) {
      console.error(`Failed to fetch ${route}:`, e.message);
    }
  }
}

testRoutes();
