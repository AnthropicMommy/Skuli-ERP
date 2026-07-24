import { SchoolRole } from "@/generated/prisma/client";

const ROLE_HIERARCHY: Record<SchoolRole, number> = {
  SUPER_ADMIN: 100,
  DIRECTOR: 90,
  PRINCIPAL: 80,
  DEPUTY_ACADEMICS: 70,
  DEPUTY_ADMIN: 65,
  BURSAR: 60,
  ACCOUNTANT: 55,
  HOD: 50,
  SENIOR_TEACHER: 45,
  CLASS_TEACHER: 40,
  TEACHER: 30,
  NURSE: 25,
  COUNSELLOR: 25,
  LIBRARIAN: 20,
  LAB_TECH: 20,
  DRIVER: 15,
  SECRETARY: 15,
  IT_MANAGER: 15,
  STUDENT: 10,
  PARENT: 10,
  BOARD_MEMBER: 5,
};

const MODULE_ACCESS: Record<string, SchoolRole[]> = {
  students: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "SECRETARY", "CLASS_TEACHER", "TEACHER", "HOD", "SENIOR_TEACHER"],
  staff: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "IT_MANAGER"],
  classes: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "CLASS_TEACHER", "TEACHER", "HOD", "SENIOR_TEACHER"],
  attendance: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "CLASS_TEACHER", "TEACHER", "HOD", "SENIOR_TEACHER"],
  exams: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "HOD", "TEACHER", "CLASS_TEACHER", "SENIOR_TEACHER"],
  fees: [],
  timetable: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "TEACHER"],
  assignments: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "HOD", "TEACHER", "CLASS_TEACHER", "SENIOR_TEACHER"],
  library: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "LIBRARIAN"],
  notifications: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "BURSAR", "SECRETARY"],
  reports: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "BURSAR", "HOD"],
  dashboard: ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "BURSAR", "HOD", "TEACHER", "CLASS_TEACHER", "SENIOR_TEACHER", "STUDENT", "PARENT", "BOARD_MEMBER"],
};

export function getRoleLevel(role: SchoolRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function canAccessModule(role: SchoolRole, module: string): boolean {
  const allowed = MODULE_ACCESS[module];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function isLeadership(role: SchoolRole): boolean {
  return getRoleLevel(role) >= 65;
}

export function isTeachingStaff(role: SchoolRole): boolean {
  return ["PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN", "HOD", "SENIOR_TEACHER", "CLASS_TEACHER", "TEACHER"].includes(role);
}

export function getRoleLabel(role: SchoolRole): string {
  const labels: Record<SchoolRole, string> = {
    SUPER_ADMIN: "Super Admin",
    DIRECTOR: "School Director",
    PRINCIPAL: "Principal",
    DEPUTY_ACADEMICS: "Deputy Principal (Academics)",
    DEPUTY_ADMIN: "Deputy Principal (Administration)",
    BURSAR: "Bursar",
    ACCOUNTANT: "Accountant",
    HOD: "Head of Department",
    SENIOR_TEACHER: "Senior Teacher",
    CLASS_TEACHER: "Class Teacher",
    TEACHER: "Teacher",
    NURSE: "School Nurse",
    COUNSELLOR: "Guidance Counsellor",
    LIBRARIAN: "Librarian",
    LAB_TECH: "Lab Technician",
    DRIVER: "Driver",
    SECRETARY: "Secretary",
    IT_MANAGER: "IT Manager",
    STUDENT: "Student",
    PARENT: "Parent",
    BOARD_MEMBER: "Board Member",
  };
  return labels[role] ?? role;
}

export function getSidebarItems(role: SchoolRole): { label: string; href: string; icon: string }[] {
  const items: { label: string; href: string; icon: string }[] = [];

  items.push({ label: "Dashboard", href: "/dashboard", icon: "Dashboard" });

  if (canAccessModule(role, "students")) {
    items.push({ label: "Students", href: "/dashboard/students", icon: "Students" });
  }

  if (canAccessModule(role, "staff")) {
    items.push({ label: "Staff", href: "/dashboard/staff", icon: "Staff" });
  }

  if (canAccessModule(role, "classes")) {
    items.push({ label: "Classes", href: "/dashboard/classes", icon: "Classes" });
  }

  if (canAccessModule(role, "attendance")) {
    items.push({ label: "Attendance", href: "/dashboard/attendance", icon: "Attendance" });
  }

  if (canAccessModule(role, "exams")) {
    items.push({ label: "Exams & Grading", href: "/dashboard/exams", icon: "Exams & Grading" });
  }

  if (canAccessModule(role, "timetable")) {
    items.push({ label: "Timetable", href: "/dashboard/timetable", icon: "Timetable" });
  }

  if (canAccessModule(role, "assignments")) {
    items.push({ label: "Assignments", href: "/dashboard/assignments", icon: "Assignments" });
  }

  if (canAccessModule(role, "library")) {
    items.push({ label: "Library", href: "/dashboard/library", icon: "Library" });
  }

  if (canAccessModule(role, "notifications")) {
    items.push({ label: "Notifications", href: "/dashboard/notifications", icon: "Notifications" });
  }

  if (canAccessModule(role, "reports")) {
    items.push({ label: "Reports", href: "/dashboard/reports", icon: "Reports" });
  }

  if (isLeadership(role)) {
    items.push({ label: "Analytics", href: "/dashboard/analytics", icon: "Analytics" });
  }

  if (isLeadership(role)) {
    items.push({ label: "Settings", href: "/dashboard/settings", icon: "Settings" });
  }

  return items;
}
