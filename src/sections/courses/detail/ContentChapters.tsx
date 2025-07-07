"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChaptersQuery } from "@/hooks/use-chapters-query";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { Clock, Play } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContentChaptersProps {
  courseId: string;
}

const ContentChapters = ({ courseId }: ContentChaptersProps) => {
  const t = useTranslations("courses");
  const limit = 5;

  const { data, isLoading } = useChaptersQuery({ courseId, page: 1, limit });
  const chapters = data?.chapters || [];
  const restChapters =
    (data?.metadata.totalChapters as number) > 5
      ? (data?.metadata.totalChapters as number) - 5
      : 0;

  return (
    <Card className="my-10">
      <CardHeader>
        <CardTitle className="text-lg">List Chapters</CardTitle>
      </CardHeader>
      <div className="">
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
          </>
        )}
      </div>
      {restChapters > 0 && (
        <CardFooter className="pb-0 py-4 ">
          <p className="w-full text-center text-gray-600">
            {restChapters} chapter lainya
          </p>
        </CardFooter>
      )}
    </Card>
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

export default ContentChapters;
