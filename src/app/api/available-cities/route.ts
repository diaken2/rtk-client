import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const citiesDir = path.join(process.cwd(), "data/cities");
    const files = await fs.readdir(citiesDir);
    const cities = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", "")); // абакан.json -> абакан

    return NextResponse.json(cities);
  } catch (err) {
    console.error("Ошибка получения городов", err);
    return NextResponse.json([], { status: 500 });
  }
}
