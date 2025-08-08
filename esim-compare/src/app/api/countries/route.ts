import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const countries = await prisma.country.findMany({
    select: { iso2: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(countries);
}
