import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { exportCsv, type ExportKind } from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/lib/db";

const KINDS: ExportKind[] = ["pickups", "enquiries", "subscribers"];

/** GET /api/admin/export?kind=pickups|enquiries|subscribers — admin only. */
export async function GET(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const kind = request.nextUrl.searchParams.get("kind") as ExportKind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Unknown export" }, { status: 400 });

  const csv = await exportCsv(kind);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="weee-${kind}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
