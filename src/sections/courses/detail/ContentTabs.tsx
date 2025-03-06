"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChaptersQuery } from "@/hooks/use-chapters-query";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { BadgeCheck, Check, Clock, Play } from "lucide-react";
import React, { useState } from "react";

interface ContentTabsProps {
  courseId: string;
}

const ContentTabs = ({ courseId }: ContentTabsProps) => {
  const [activeTab, setActiveTab] = useState("courseModules");

  const { data, isLoading } = useChaptersQuery({ courseId, page: 1, limit: 5 });
  const chapters = data?.chapters || [];

  return (
    <Tabs
      defaultValue="courseModules"
      className="mb-8"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="courseModules">Modul</TabsTrigger>
        <TabsTrigger value="aboutCertificates">Sertifikat</TabsTrigger>
      </TabsList>

      <TabsContent value="courseModules" className="space-y-4 mt-6">
        {isLoading ? (
          <ChaptersSkeleton />
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full">
              {chapters.map((chapter, index) => (
                <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">{chapter.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatVideoDuration(chapter.duration as number)}
                            </span>
                            {chapter.isFree && (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3">
                    <p className="text-gray-600 mb-4">{chapter.description}</p>
                    <Button
                      disabled={!chapter.isFree}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {chapter.isFree ? "Watch Preview" : "Enroll to Watch"}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
              Mulai Kursus Sekarang
            </Button>
          </>
        )}
      </TabsContent>

      <TabsContent value="aboutCertificates" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sertifikasi Kursus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3 flex justify-center items-center">
                <BadgeCheck size={75} className="text-green-500" />
              </div>
              <div className="md:w-2/3 space-y-4">
                <h3 className="text-lg font-medium">
                  Selesaikan Kursus ini & Dapatkan Sertifikat Anda!
                </h3>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Dapatkan Sertifikat</p>
                    <p className="text-sm text-gray-600">
                      Sertifikat penyelesaian kursus untuk menunjukkan
                      keterampilan Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Kredensial Digital yang Dapat Dibagikan
                    </p>
                    <p className="text-sm text-gray-600">
                      Anda akan menerima sertifikat digital yang dapat Anda
                      bagikan di resume dan media sosial Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Maju dalam Karier Anda</p>
                    <p className="text-sm text-gray-600">
                      Tambahkan keterampilan ini ke profil LinkedIn Anda untuk
                      menunjukkan kemampuan Anda.
                    </p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Mulai Belajar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const ChaptersSkeleton = () => {
  return (
    <>
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </>
  );
};

export default ContentTabs;
