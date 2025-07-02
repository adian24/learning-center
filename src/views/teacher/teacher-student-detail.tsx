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
import { useTranslations } from "next-intl";

const TeacherStudentDetail = () => {
  const t = useTranslations("teacher_student_detail");

  const params = useParams();
  const studentId = params?.studentId as string;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { overview: student, isLoading } = useStudentOverview(studentId);
  const { courses, isLoading: isLoadingCourses } =
    useStudentCourseProgress(studentId);

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

  const courseNotFound = t("course_not_found");
  const noDescription = t("no_description");

  const trainings =
    courses?.map((course: any, index: number) => ({
      title: course.course?.title || courseNotFound,
      hasCertificate: course.progress === 100,
      description: course.course?.description || noDescription,
      certificateUrl: course.certificateUrl || undefined,
    })) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6 px-4">
      <Card className="shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Image
            src={student.image ?? ""}
            alt={student.name ?? t("photo_student")}
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
            {t("student_stats")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-500">{t("joined_date")}</p>
            <p className="font-medium">
              {new Date(student.joinDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("last_activity")}</p>
            <p className="font-medium">
              {student.lastActivity
                ? new Date(student.lastActivity).toLocaleDateString("id-ID")
                : t("no_activity")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("total_courses")}</p>
            <p className="font-medium">{student.totalCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("completed_courses")}</p>
            <p className="font-medium">{student.completedCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("average_progress")}</p>
            <p className="font-medium">{student.averageProgress}%</p>
          </div>
          <div>
            <p className="text-gray-500">{t("watch_time")}</p>
            <p className="font-medium">{student.totalWatchTime}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-gray-500">{t("performance_level")}</p>
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
            {t("title_training")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <p className="text-gray-500">{t("no_training")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12 text-center" />
                    <TableHead>{t("table_title")}</TableHead>
                    <TableHead>{t("table_certificate")}</TableHead>
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
                                ? t("certificate_available")
                                : t("certificate_unavailable")}
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
                                <strong>{t("description")}:</strong>
                                <p className="text-gray-600">
                                  {training.description}
                                </p>
                              </div>
                              {training.certificateUrl ? (
                                <div className="flex flex-col items-center gap-3">
                                  <Image
                                    height={50}
                                    width={50}
                                    src={training.certificateUrl}
                                    alt={`${t("certificate")} ${
                                      training.title
                                    }`}
                                    className="w-full max-w-sm rounded shadow border hover:scale-105 transition-transform"
                                  />
                                  <div className="flex gap-3">
                                    <a
                                      href={training.certificateUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <Button variant="default" size="sm">
                                        {t("view_certificate")}
                                      </Button>
                                    </a>
                                    <a href={training.certificateUrl} download>
                                      <Button variant="secondary" size="sm">
                                        {t("download")}
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">
                                  {t("certificate_unavailable")}
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
