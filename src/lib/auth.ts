import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "skuli-dev-secret-change-in-production";

export interface StudentSession {
  studentId: string;
  schoolId: string;
  admissionNo: string;
  name: string;
  grade: string;
}

export interface ParentSession {
  studentId: string;
  schoolId: string;
  parentName: string;
  studentName: string;
}

export function signStudentToken(payload: StudentSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signParentToken(payload: ParentSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): StudentSession | ParentSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as StudentSession | ParentSession;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/skuli_token=([^;]+)/);
  return match ? match[1] : null;
}
