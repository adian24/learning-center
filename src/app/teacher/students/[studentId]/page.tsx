"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Layout from "@/layout";
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
import { useStudents } from "@/hooks/use-students";
import clsx from "clsx";
import React from "react";

interface Training {
  title: string;
  hasCertificate: boolean;
  description: string;
  certificateUrl?: string;
}

const StudentDetailPage = () => {
  const params = useParams();
  const studentId = params?.studentId as string;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { students, isLoading } = useStudents();

  const student = students.find((item) => item.id === studentId);

  if (isLoading || !student) {
    return (
      <Layout>
        <div className="p-10 text-center text-gray-600 animate-pulse">
          Memuat detail siswa...
        </div>
      </Layout>
    );
  }

  const trainings: Training[] = student.enrolledCourses.map(
    (course, index) => ({
      title: course,
      hasCertificate: index % 2 === 0,
      description: `Deskripsi lengkap untuk pelatihan ${course}.`,
      certificateUrl:
        index % 2 === 0
          ? `https://example.com/certificates/${studentId}-${index}.jpg`
          : undefined,
    })
  );

  return (
    <Layout>
      <div className="mx-auto space-y-6 pb-6 px-4">
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {student.name}
            </CardTitle>
            <p className="text-sm text-gray-500">{student.email}</p>
          </CardHeader>
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
                      <TableHead className="font-medium text-gray-700 min-w-[200px]">
                        Nama Pelatihan
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 min-w-[200px]">
                        Status Sertifikat
                      </TableHead>
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
                              <span className="whitespace-nowrap">
                                {training.hasCertificate
                                  ? "Sertifikat tersedia"
                                  : "Belum ada sertifikat"}
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
                              <div className="space-y-4 text-sm text-gray-700 animate-fade-in">
                                <div>
                                  <strong className="text-gray-800 block mb-1">
                                    Deskripsi:
                                  </strong>
                                  <p className="text-gray-600">
                                    {training.description}
                                  </p>
                                </div>

                                {training.certificateUrl ? (
                                  <Card className="bg-white border shadow-sm">
                                    <CardHeader>
                                      <CardTitle className="text-lg text-sky-700 text-center">
                                        Sertifikat Pelatihan
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center gap-4">
                                      <img
                                        src={training.certificateUrl}
                                        alt={`Sertifikat ${training.title}`}
                                        className="p-3 mb-4 rounded-xl border w-full max-w-sm object-cover shadow-md hover:scale-105 transition-transform"
                                      />
                                      <div className="flex gap-3 flex-wrap justify-center">
                                        <a
                                          href={training.certificateUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-sky-600 hover:bg-sky-700 hover:scale-105 transition-transform"
                                          >
                                            Lihat Sertifikat
                                          </Button>
                                        </a>
                                        <a
                                          href={training.certificateUrl}
                                          download
                                        >
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            className="text-sky-700 hover:text-white border border-sky-700 bg-white hover:bg-sky-700 hover:scale-105 transition-transform"
                                          >
                                            Download
                                          </Button>
                                        </a>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Card className="shadow-sm">
                                    <CardContent className="text-center text-sm text-sky-700 py-4">
                                      <div className="flex justify-center items-center">
                                        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
                                          <div className="mb-4">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-16 w-16 mx-auto text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                            </svg>
                                          </div>
                                          <h3 className="text-xl font-bold mb-2">
                                            Tidak ada sertifikat yang ditemukan
                                          </h3>
                                          <p className="text-gray-500 mb-4">
                                            Maaf, sertifikat belum tersedia saat
                                            ini, harap menyelesaikan materi...
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
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
    </Layout>
  );
};

export default StudentDetailPage;
