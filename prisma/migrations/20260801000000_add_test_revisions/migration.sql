-- CreateTable
CREATE TABLE "test_revisions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_revisions_studentId_idx" ON "test_revisions"("studentId");

-- AddForeignKey
ALTER TABLE "test_revisions" ADD CONSTRAINT "test_revisions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
