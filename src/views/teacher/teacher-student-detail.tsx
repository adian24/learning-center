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
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Download,
  Eye,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStudentCourseProgress,
  useStudentOverview,
} from "@/hooks/use-students";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import { CourseShimmerDetail } from "./shimmer/course-shimmer-detail";
import { toast } from "sonner";

type TrainingCertificate = {
  id: string | null;
  title: string;
  hasCertificate: boolean;
  certificateNumber: string | null;
  certificateUrl: string | null;
  chapters: {
    id: string;
    title: string;
    position: number;
    duration: number | null;
    isCompleted: boolean;
    watchedSeconds: number;
    lastWatchedAt: string | null;
  }[];
};

const TeacherStudentDetail = () => {
  const params = useParams();
  const studentId = params?.studentId as string;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { overview: student, isLoading } = useStudentOverview(studentId);
  const { courses, certificate: certificates } =
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
  const formatWatchTime = (seconds: number) => {
    if (!seconds || seconds <= 0) {
      return "0 menit";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours) parts.push(`${hours} jam`);
    if (minutes) parts.push(`${minutes} menit`);
    if (!hours && !minutes && secs) parts.push(`${secs} detik`);
    return parts.join(" ") || "0 menit";
  };

  const formatDuration = (duration: number | null | undefined) => {
    if (!duration || duration <= 0) {
      return "-";
    }

    const totalSeconds = Math.round(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts: string[] = [];
    if (hours) parts.push(`${hours}j`);
    if (minutes) parts.push(`${minutes}m`);
    if (!hours && !minutes && secs) parts.push(`${secs}d`);
    return parts.join(" ") || `${totalSeconds}s`;
  };

  const calculateTrainingStats = () => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalWatchTime: "0 menit",
        firstEnrollmentDate: null as string | null,
        lastActivityDate: null as string | null,
      };
    }

    let progressSum = 0;
    let totalWatchSeconds = 0;
    let firstEnrollment: Date | null = null;
    let lastActivity: Date | null = null;

    courses.forEach((enrollment) => {
      progressSum += enrollment.progress ?? 0;
      totalWatchSeconds += enrollment.watchTimeSeconds || 0;

      const enrollmentDate = enrollment.createdAt
        ? new Date(enrollment.createdAt)
        : null;

      if (enrollmentDate) {
        if (!firstEnrollment || enrollmentDate < firstEnrollment) {
          firstEnrollment = enrollmentDate;
        }
      }

      const activitySource = enrollment.lastActivity || enrollment.updatedAt;
      const activityDate = activitySource ? new Date(activitySource) : null;
      if (activityDate) {
        if (!lastActivity || activityDate > lastActivity) {
          lastActivity = activityDate;
        }
      }
    });

    const totalCourses = courses.length;
    const completedCourses = Math.min(
      certificates?.length ?? 0,
      totalCourses
    );

    return {
      totalCourses,
      completedCourses,
      averageProgress:
        totalCourses > 0 ? Math.round(progressSum / totalCourses) : 0,
      totalWatchTime: formatWatchTime(totalWatchSeconds),
      firstEnrollmentDate: firstEnrollment ?? null,
      lastActivityDate: lastActivity ?? null,
    };
  };

  const trainingStats = calculateTrainingStats();

  const trainings: TrainingCertificate[] =
    courses?.map((enrollment) => ({
      id: enrollment.certificate?.id ?? null,
      title: enrollment.course?.title || "Pelatihan Tidak Diketahui",
      hasCertificate: Boolean(enrollment.certificate?.pdfUrl),
      certificateNumber: enrollment.certificate?.certificateNumber ?? null,
      certificateUrl: enrollment.certificate?.pdfUrl ?? null,
      chapters:
        enrollment.course?.chapters?.map((chapter) => {
          const userProgress = chapter.userProgress?.[0];

          return {
            id: chapter.id,
            title: chapter.title,
            position: chapter.position,
            duration: chapter.duration,
            isCompleted: userProgress?.isCompleted ?? false,
            watchedSeconds: userProgress?.watchedSeconds ?? 0,
            lastWatchedAt: userProgress?.lastWatchedAt ?? null,
          };
        }) ?? [],
    })) ?? [];

  const joinDateDisplay = trainingStats.firstEnrollmentDate
    ? new Date(trainingStats.firstEnrollmentDate).toLocaleDateString("id-ID")
    : student.joinDate
    ? new Date(student.joinDate).toLocaleDateString("id-ID")
    : "-";

  const lastActivityDisplay = trainingStats.lastActivityDate
    ? new Date(trainingStats.lastActivityDate).toLocaleDateString("id-ID")
    : student.lastActivity
    ? new Date(student.lastActivity).toLocaleDateString("id-ID")
    : "Belum ada aktivitas";

  const computedPerformanceLevel = trainingStats.totalCourses
    ? trainingStats.averageProgress >= 80
      ? "excellent"
      : trainingStats.averageProgress >= 50
      ? "average"
      : "needs_improvement"
    : student.performanceLevel;

  const performanceLabel = computedPerformanceLevel
    ? computedPerformanceLevel.replace("_", " ")
    : "-";

  const handleViewCertificate = async (training: TrainingCertificate) => {
    if (!training.certificateUrl || !training.id) {
      toast.error("Sertifikat belum tersedia.");
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/certificates/view?certificateId=${training.id}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal membuka sertifikat");
      }

      const { url } = await response.json();

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuka sertifikat"
      );
    }
  };

  const handleDownloadCertificate = async (training: TrainingCertificate) => {
    if (!training.certificateUrl || !training.id) {
      toast.error("Sertifikat belum tersedia.");
      return;
    }

    try {
      setDownloadingId(training.id);

      const response = await fetch(
        `/api/teacher/certificates/download?certificateId=${training.id}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengunduh sertifikat");
      }

      const { url } = await response.json();

      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${
        training.certificateNumber || training.id
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Sertifikat berhasil diunduh!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengunduh sertifikat"
      );
    } finally {
      setDownloadingId(null);
    }
  };

  console.log("COURSES ", courses );
  console.log("TRAININGS ", trainings );
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
            <p className="font-medium">{joinDateDisplay}</p>
          </div>
          <div>
            <p className="text-gray-500">Aktivitas Terakhir</p>
            <p className="font-medium">{lastActivityDisplay}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Pelatihan</p>
            <p className="font-medium">{trainingStats.totalCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">Selesai</p>
            <p className="font-medium">{trainingStats.completedCourses}</p>
          </div>
          <div>
            <p className="text-gray-500">Rata-rata Progres</p>
            <p className="font-medium">{trainingStats.averageProgress}%</p>
          </div>
          <div>
            <p className="text-gray-500">Waktu Tonton</p>
            <p className="font-medium">{trainingStats.totalWatchTime}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-gray-500">Tingkat Performa</p>
            <p
              className={clsx("capitalize font-semibold", {
                "text-red-600":
                  computedPerformanceLevel === "needs_improvement",
                "text-yellow-600": computedPerformanceLevel === "average",
                "text-green-600": computedPerformanceLevel === "excellent",
              })}
            >
              {performanceLabel}
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
                    <TableHead>Nomor Sertifikat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainings.map((training, index) => (
                    <React.Fragment key={training.id || index}>
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
                                ? "Selesai"
                                : "Belum Selesai"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>
                              {training.certificateNumber
                                ? training.certificateNumber
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setOpenIndex(openIndex === index ? null : index)
                            }
                            className="px-0 text-blue-600 hover:text-blue-700"
                          >
                            {openIndex === index ? "Sembunyikan" : "Detail"}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {openIndex === index && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="bg-gray-50 p-5 border-t"
                          >
                            <div className="space-y-5 text-sm text-gray-700 animate-fade-in">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  Sertifikat
                                </p>
                                {training.certificateUrl ? (
                                  <div className="mt-2 flex flex-wrap gap-3">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleViewCertificate(training)
                                      }
                                      disabled={!training.certificateUrl}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Lihat Sertifikat
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadCertificate(training)
                                      }
                                      disabled={
                                        !training.certificateUrl ||
                                        downloadingId === training.id
                                      }
                                    >
                                      {downloadingId === training.id ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4 mr-1" />
                                      )}
                                      {downloadingId === training.id
                                        ? "Mengunduh..."
                                        : "Download"}
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="mt-2 text-gray-500 italic">
                                    Sertifikat belum tersedia.
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  Detail Chapter
                                </p>
                                {training.chapters.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    {training.chapters
                                      .sort((a, b) => a.position - b.position)
                                      .map((chapter) => (
                                        <div
                                          key={chapter.id}
                                          className="rounded-md border border-gray-200 bg-white/70 p-3"
                                        >
                                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                              <p className="font-medium text-gray-800">
                                                {chapter.position}. {chapter.title}
                                              </p>
                                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="h-3.5 w-3.5" />
                                                  Durasi: {formatDuration(chapter.duration)}
                                                </span>
                                                <span>
                                                  Ditonton: {formatWatchTime(chapter.watchedSeconds)}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                              <CheckCircle
                                                className={clsx("h-4 w-4", {
                                                  "text-green-500": chapter.isCompleted,
                                                  "text-gray-400": !chapter.isCompleted,
                                                })}
                                              />
                                              <span className="uppercase tracking-wide text-gray-600">
                                                {training.chapters != null && chapter.isCompleted ? "Selesai" : "Proses"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="mt-2 text-gray-500 italic">
                                    Belum ada data chapter untuk kursus ini.
                                  </p>
                                )}
                              </div>
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
