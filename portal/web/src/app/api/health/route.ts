export function GET() {
  return Response.json({
    service: "masicarus-portal",
    status: "healthy",
  });
}
