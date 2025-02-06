import ButtonNvigation from "@/components/button-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, FileText, LayoutGrid, Plus, UsersRound } from "lucide-react";
import React from "react";

const TeacherEmptyCourse = () => {
  return (
    <>
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-primary/10 p-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>

            {/* Text Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Belum Ada Course</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Anda belum memiliki course. Mulai dengan membuat course pertama
                Anda untuk berbagi pengetahuan dengan Students.
              </p>
            </div>

            {/* Primary Action */}
            <ButtonNvigation
              text={`Buat Course Baru`}
              url="/teacher/courses/create"
              className="mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <LayoutGrid className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Course Structure</CardTitle>
            <CardDescription>
              Buat struktur course yang terorganisir dengan chapter dan materi
              pembelajaran
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Quiz & Assessments</CardTitle>
            <CardDescription>
              Evaluasi pemahaman siswa dengan quiz dan tugas interaktif
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <UsersRound className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Student Management</CardTitle>
            <CardDescription>
              Kelola dan pantau progress siswa yang mengikuti course Anda
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Panduan Memulai</CardTitle>
          <CardDescription>
            Ikuti langkah-langkah berikut untuk membuat course pertama Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium">Buat Course Baru</h4>
                <p className="text-sm text-gray-500">
                  Tentukan judul, deskripsi, dan level course Anda
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium">Tambahkan Chapter</h4>
                <p className="text-sm text-gray-500">
                  Susun materi pembelajaran dalam chapter yang terstruktur
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium">Upload Konten</h4>
                <p className="text-sm text-gray-500">
                  Upload video, dokumen, dan materi pembelajaran lainnya
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-medium">Publish Course</h4>
                <p className="text-sm text-gray-500">
                  Review dan publikasikan course Anda agar dapat diakses oleh
                  siswa
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TeacherEmptyCourse;
