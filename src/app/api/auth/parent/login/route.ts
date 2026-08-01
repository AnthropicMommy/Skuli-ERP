import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signParentToken } from "@/lib/auth";
import { comparePassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const parent = await prisma.parent.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordValid = await comparePassword(password, parent.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Find a child associated with this parent (by email or phone)
    const child = await prisma.student.findFirst({
      where: {
        OR: [
          { parentEmail: email.toLowerCase() },
          { parentPhone: parent.phone ?? undefined },
        ],
      },
      select: { id: true, schoolId: true, name: true },
    });

    const payload: any = {
      parentId: parent.id,
      parentEmail: parent.email,
      parentName: `${parent.firstName} ${parent.lastName}`,
    };

    if (child) {
      payload.studentId = child.id;
      payload.schoolId = child.schoolId;
      payload.studentName = child.name;
    }

    const token = signParentToken(payload);

    return NextResponse.json({
      token,
      parent: {
        id: parent.id,
        email: parent.email,
        name: `${parent.firstName} ${parent.lastName}`,
      },
      child: child
        ? {
            id: child.id,
            schoolId: child.schoolId,
            name: child.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Parent login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
