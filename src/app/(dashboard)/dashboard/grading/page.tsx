import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GradingForm } from "@/components/grading-form";

export default async function GradingPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  const school = await prisma.school.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!school) {
    redirect("/onboarding");
  }

  const students = await prisma.student.findMany({
    where: { schoolId: school.id },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  const grades = [...new Set(students.map((s) => s.grade))].sort();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CBC Grading</h1>
        <p className="text-gray-600 mt-1">
          Enter rubric-based assessment marks for your students
        </p>
      </div>

      <GradingForm students={students} grades={grades} />
    </div>
  );
}
