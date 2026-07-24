import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signParentToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, firstName, lastName, phone } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Email, password, first name, and last name are required" }, { status: 400 });
  }

  const existing = await prisma.parent.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const parent = await prisma.parent.create({
    data: { email, password: hashedPassword, firstName, lastName, phone },
  });

  const children = await prisma.student.findMany({
    where: { parentEmail: email },
  });

  for (const child of children) {
    await prisma.student.update({
      where: { id: child.id },
      data: { parentId: parent.id },
    });
  }

  const token = signParentToken({
    studentId: children[0]?.id || "",
    schoolId: children[0]?.schoolId || "",
    parentName: `${firstName} ${lastName}`,
    studentName: children[0]?.name || "",
  });

  return NextResponse.json({ token, parent: { id: parent.id, email: parent.email }, childrenLinked: children.length }, { status: 201 });
}
