"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStudentCourseProgress,
  useStudentOverview,
} from "@/hooks/use-students";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import { CourseShimmerDetail } from "./shimmer/course-shimmer-detail";

const TeacherStudentDetail = () => {
  const params = useParams();
  const studentId = params?.studentId as string;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { overview: student, isLoading } = useStudentOverview(studentId);
  const { courses, isLoading: isLoadingCourses } =
    useStudentCourseProgress(studentId);

  console.log("courses", courses);
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-6 px-4">
        <CourseShimmerDetail />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-gray-600">Data siswa tidak ditemukan.</p>
      </div>
    );
  }

  const trainings =
    courses?.map((course: any, index: number) => ({
      title: course.course?.title || "Pelatihan Tidak Diketahui",
      hasCertificate: course.progress === 100,
      description: course.course?.description || "Tidak ada deskripsi.",
      certificateUrl: course.certificateUrl || undefined,
    })) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6 px-4">
      <Card className="shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Image
            src={student?.image || ""}
            alt={student?.name || "Foto Siswa"}
            width={64}
            height={64}
            className="rounded-full border shadow object-cover"
          />
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {student.name}
            </CardTitle>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">
            Statistik Siswa
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-500">Tanggal Bergabung</p>
            <p className="font-medium">
              {new Date(student.joinDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Aktivitas Terakhir</p>
            <p className="font-medium">
              {student.lastActivity
                ? new Date(student.lastActivity).toLocaleDateString("id-ID")
                : "Belum ada aktivitas"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total Pelatihan</p>
            <p className="font-medium">{student.totalCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">Selesai</p>
            <p className="font-medium">{student.completedCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">Rata-rata Progres</p>
            <p className="font-medium">{student.averageProgress}%</p>
          </div>
          <div>
            <p className="text-gray-500">Waktu Tonton</p>
            <p className="font-medium">{student.totalWatchTime}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-gray-500">Tingkat Performa</p>
            <p
              className={clsx("capitalize font-semibold", {
                "text-red-600":
                  student.performanceLevel === "needs_improvement",
                "text-yellow-600": student.performanceLevel === "average",
                "text-green-600": student.performanceLevel === "excellent",
              })}
            >
              {student.performanceLevel.replace("_", " ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">
            Pelatihan Diikuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <p className="text-gray-500">Belum mengikuti pelatihan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12 text-center" />
                    <TableHead>Nama Pelatihan</TableHead>
                    <TableHead>Status Sertifikat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainings.map((training, index) => (
                    <React.Fragment key={index}>
                      <TableRow className="hover:bg-gray-50 transition">
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setOpenIndex(openIndex === index ? null : index)
                            }
                            className="p-0"
                          >
                            {openIndex === index ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{training.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              className={clsx("w-4 h-4", {
                                "text-green-500": training.hasCertificate,
                                "text-gray-400": !training.hasCertificate,
                              })}
                            />
                            <span>
                              {training.hasCertificate
                                ? "Tersedia"
                                : "Belum tersedia"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

                      {openIndex === index && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="bg-gray-50 p-4 border-t"
                          >
                            <div className="space-y-3 text-sm text-gray-700 animate-fade-in">
                              <div>
                                <strong>Deskripsi:</strong>
                                <p className="text-gray-600">
                                  {training.description}
                                </p>
                              </div>
                              {training.certificateUrl ? (
                                <div className="flex flex-col items-center gap-3">
                                  <img
                                    src={training.certificateUrl}
                                    alt={`Sertifikat ${training.title}`}
                                    className="w-full max-w-sm rounded shadow border hover:scale-105 transition-transform"
                                  />
                                  <div className="flex gap-3">
                                    <a
                                      href={training.certificateUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <Button variant="default" size="sm">
                                        Lihat Sertifikat
                                      </Button>
                                    </a>
                                    <a href={training.certificateUrl} download>
                                      <Button variant="secondary" size="sm">
                                        Download
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">
                                  Sertifikat belum tersedia.
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudentDetail;
