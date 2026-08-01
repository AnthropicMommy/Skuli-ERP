import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/material-viewer";

export const dynamic = "force-dynamic";

export default async function MaterialViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const material = await prisma.sourceMaterial.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      subject: true,
      grade: true,
      materialType: true,
      fileUrl: true,
    },
  });

  if (!material) notFound();

  return (
    <MaterialViewer
      fileUrl={material.fileUrl}
      title={material.title}
      subject={material.subject}
      grade={String(material.grade)}
      materialType={material.materialType}
    />
  );
}
