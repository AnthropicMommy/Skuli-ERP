import { prisma } from "@/lib/prisma";
import { SchoolRole, Term } from "@/generated/prisma/client";

export async function getStaffByClerkId(clerkUserId: string) {
  return prisma.staff.findFirst({
    where: { clerkUserId },
    include: { school: true, department: true },
  });
}

export async function getSchoolById(schoolId: string) {
  return prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: {
        select: {
          students: true,
          staff: true,
        },
      },
    },
  });
}

export async function getStudentsBySchool(schoolId: string, grade?: string) {
  return prisma.student.findMany({
    where: {
      schoolId,
      ...(grade ? { grade } : {}),
    },
    orderBy: [{ grade: "asc" }, { admissionNo: "asc" }],
  });
}

export async function getStaffBySchool(schoolId: string, role?: string) {
  return prisma.staff.findMany({
    where: {
      schoolId,
      ...(role ? { role: role as SchoolRole } : {}),
    },
    include: { department: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function getAttendanceByDate(schoolId: string, date: string, grade?: string) {
  const dateObj = new Date(date);
  return prisma.attendance.findMany({
    where: {
      student: { schoolId, ...(grade ? { grade } : {}) },
      date: dateObj,
    },
    include: { student: true },
  });
}

export async function getExamsBySchool(schoolId: string, term: string, year: number) {
  return prisma.exam.findMany({
    where: { schoolId, term: term as Term, year },
    include: { _count: { select: { results: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTimetableByGrade(schoolId: string, grade: string, stream?: string) {
  return prisma.timetable.findMany({
    where: {
      schoolId,
      grade,
      ...(stream ? { stream } : {}),
    },
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
  });
}

export async function getLibraryBooks(schoolId: string) {
  return prisma.libraryBook.findMany({
    where: { schoolId },
    orderBy: { title: "asc" },
  });
}

export async function getNotifications(schoolId: string, studentId?: string) {
  return prisma.notification.findMany({
    where: {
      schoolId,
      ...(studentId ? { studentId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getAuditLogs(schoolId: string) {
  return prisma.auditLog.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
