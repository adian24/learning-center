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
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ContentTabsProps {
  courseId: string;
}

const ContentTabs = ({ courseId }: ContentTabsProps) => {
  const t = useTranslations("courses");

  const { data: session } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("courseModules");

  const { data, isLoading } = useChaptersQuery({ courseId, page: 1, limit: 5 });
  const chapters = data?.chapters || [];

  const handleCourseStart = () => {
    if (session?.user) {
      router.push(`/courses/${courseId}/checkout`);
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <Tabs
      defaultValue="courseModules"
      className="mb-8"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="courseModules">{t("tab_modules")}</TabsTrigger>
        <TabsTrigger value="aboutCertificates">
          {t("tab_certificates")}
        </TabsTrigger>
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
                                {t("free")}
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
                      {chapter.isFree
                        ? t("watch_preview")
                        : t("enroll_to_watch")}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button
              className="w-full mt-4 text-blue-600 bg-transparent hover:bg-transparent hover:underline"
              onClick={handleCourseStart}
            >
              {t("start_course")}
            </Button>
          </>
        )}
      </TabsContent>

      <TabsContent value="aboutCertificates" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("certificate_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3 flex justify-center items-center">
                <BadgeCheck size={75} className="text-green-500" />
              </div>
              <div className="md:w-2/3 space-y-4">
                <h3 className="text-lg font-medium">
                  {t("certificate_heading")}
                </h3>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("certificate_point_1_title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("certificate_point_1_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("certificate_point_2_title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("certificate_point_2_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("certificate_point_3_title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("certificate_point_3_desc")}
                    </p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  {t("start_learning")}
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
