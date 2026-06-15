export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    status: "healthy",
    service: "ToolBox Pro",
    timestamp: new Date().toISOString(),
  });
}
