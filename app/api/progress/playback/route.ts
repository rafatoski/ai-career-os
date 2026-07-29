import { NextResponse } from "next/server";
import { z } from "zod";

import { savePlaybackProgress } from "@/lib/learning-progress";

const payloadSchema = z.object({
  moduleSlug: z.string().min(1),
  lessonId: z.string().min(1),
  position: z.number().nonnegative(),
  duration: z.number().positive(),
  ended: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    await savePlaybackProgress(payload);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid playback progress." },
      { status: 400 },
    );
  }
}
