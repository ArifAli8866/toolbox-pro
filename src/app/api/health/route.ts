// Simple health check - no database dependency needed for this app.
// This app is 100% client-side. All tools run in the browser.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "ToolBox Pro",
    message: "All systems operational. No database required."
  });
}