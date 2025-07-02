import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  MoveUpRight,
  VideoOff,
  GraduationCap,
  BookText,
} from "lucide-react";
import { Chapter } from "@/lib/types";
import { useChaptersQuery } from "@/hooks/use-chapters-query";
import { useRouter } from "next/navigation";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { useTranslations } from "next-intl";

interface ChapterListProps {
  courseId: string;
}

export function ChapterList({ courseId }: ChapterListProps) {
  const t = useTranslations("chapters");

  const router = useRouter();

  const { data: chapters, isLoading } = useChaptersQuery({
    courseId,
    page: 1,
    limit: 3,
  });

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="my-4 w-full space-y-2">
        {chapters?.chapters?.map((chapter: Chapter) => (
          <AccordionItem
            key={chapter.id}
            value={chapter.id}
            className="border-none rounded-md px-4 bg-secondary"
          >
            <AccordionTrigger className="flex items-center justify-between px-4">
              <div className="flex items-center gap-x-2">
                <span className="text-left line-clamp-2">{chapter.title}</span>
                {chapter.isFree && (
                  <Badge variant="outline" className="bg-green-300">
                    {t("badge_free")}
                  </Badge>
                )}
                {!chapter.isPublished && (
                  <Badge variant="default" className="bg-orange-400">
                    {t("badge_draft")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-4 space-x-2">
                {/* Description */}
                {chapter.description && (
                  <p className="text-sm text-muted-foreground">
                    {chapter.description}
                  </p>
                )}

                {/* Video Section */}
                <Badge variant="outline" className="gap-2">
                  {chapter?.videoUrl ? (
                    <>
                      <Video className="h-4 w-4 text-green-600" />
                      {formatVideoDuration(chapter?.duration as number)}
                    </>
                  ) : (
                    <>
                      <VideoOff className="h-4 w-4 text-red-600" />
                      {t("badge_no_video")}
                    </>
                  )}
                </Badge>

                {/* Quiz Section */}
                <Badge variant="outline" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t("quizzes_count", { count: chapter?.quizzes?.length || 0 })}
                </Badge>

                {/* Resources Section */}
                <Badge variant="outline" className="gap-2">
                  <BookText className="h-4 w-4" />
                  {t("resources_count", {
                    count: chapter?.resources?.length || 0,
                  })}
                </Badge>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-center mt-8">
        <Button
          variant="link"
          size={"sm"}
          type="button"
          className="underline text-blue-600 hover:text-blue-900"
          onClick={() => router.push(`/teacher/courses/${courseId}/chapters`)}
        >
          {t("see_all_chapters", {
            count: chapters?.metadata.totalChapters ?? 0,
          })}
          <MoveUpRight />
        </Button>
      </div>
    </div>
  );
}
