import { Metadata } from "next";
import db from "@/lib/db/db";
import Layout from "@/layout";
import TeacherStudentDetail from "@/views/teacher/teacher-student-detail";

interface Props {
  params: {
    studentId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const student = await db.studentProfile.findUnique({
    where: { id: params.studentId },
    include: {
      user: true,
    },
  });

  return {
    title: student ? `Detail Siswa: ${student.user.name}` : "Detail Siswa",
    description: student
      ? `Lihat detail pelatihan dan performa siswa ${student.user.name}.`
      : "Halaman detail siswa untuk pengajar.",
  };
}

export default function StudentDetailPage() {
  return (
    <Layout>
      <TeacherStudentDetail />
    </Layout>
  );
}
