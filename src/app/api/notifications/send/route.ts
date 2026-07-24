import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { schoolId, title, message, phone } = body;

  // In production: send SMS via Africa's Talking / Twilio
  // For now, just log and store in DB
  console.log(`[SMS STUB] To: ${phone} | Title: ${title} | Message: ${message}`);

  const notification = await prisma.notification.create({
    data: {
      schoolId,
      title,
      message,
      type: "general",
      channel: "sms",
    },
  });

  return NextResponse.json({ ok: true, id: notification.id });
}
