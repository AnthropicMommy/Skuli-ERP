import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadMaterial } from "@/lib/blob";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const subject = formData.get("subject") as string;
  const type = formData.get("type") as string;
  const classId = formData.get("classId") as string;

  if (!file || !title || !subject || !classId) {
    return NextResponse.json({ error: "file, title, subject, and classId are required" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "text/plain",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed. Upload PDF, DOC, DOCX, PNG, JPG, or TXT." }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 20MB" }, { status: 400 });
  }

  const { url } = await uploadMaterial(file, staff.schoolId);

  const material = await prisma.material.create({
    data: {
      title,
      description: description || null,
      subject,
      type: type || "pdf",
      fileUrl: url,
      organizationId: staff.schoolId,
      classId,
      uploadedById: staff.id,
    },
  });

  return NextResponse.json(material, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const subject = url.searchParams.get("subject");

  // Try staff auth first (Clerk)
  const { userId } = await auth();
  let schoolId: string | null = null;

  if (userId) {
    const staff = await prisma.staff.findFirst({
      where: { clerkUserId: userId },
      select: { schoolId: true },
    });
    schoolId = staff?.schoolId ?? null;
  }

  // If no staff auth, try student/parent JWT
  if (!schoolId) {
    const { verifyToken, getTokenFromRequest } = await import("@/lib/auth");
    const token = getTokenFromRequest(req);
    if (token) {
      const session = verifyToken(token);
      if (session && "schoolId" in session) {
        schoolId = session.schoolId;
      }
    }
  }

  if (!schoolId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where: Record<string, unknown> = { organizationId: schoolId };
  if (classId) where.classId = classId;
  if (subject) where.subject = subject;

  const materials = await prisma.material.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(materials);
}
