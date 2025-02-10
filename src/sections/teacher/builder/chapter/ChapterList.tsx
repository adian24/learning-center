// components/chapters/chapter-list.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  FileText,
  Link,
  FileBox,
  Settings,
  BookCheck,
} from "lucide-react";
import { useSettingChapterStore } from "@/store/use-store-setting-chapter";
// import { ChapterSettingsDialog } from "./chapter-settings-dialog";
// import { useDialogStore } from "@/store/dialog-store";

interface Resource {
  id: string;
  type: "PDF" | "LINK" | "FILE";
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  isPublished: boolean;
  videoUrl: string | null;
  position: number;
  resources: Resource[];
  quizzes: { id: string }[];
  userProgress: {
    isCompleted: boolean;
    watchedSeconds: number;
  } | null;
}

interface ChapterListProps {
  courseId: string | number;
}

export function ChapterList({ courseId }: ChapterListProps) {
  const openChapterSettingsDialog = useSettingChapterStore(
    (state) => state.onOpen
  );

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/courses/${courseId}/chapters`);
      if (!response.ok) throw new Error("Failed to fetch chapters");
      return response.json();
    },
  });

  //   const { openChapterSettingsDialog } = useDialogStore();

  if (isLoading) {
    return <div>Loading chapters...</div>;
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "LINK":
        return <Link className="h-4 w-4" />;
      case "FILE":
        return <FileBox className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {chapters?.map((chapter: Chapter) => (
          <AccordionItem key={chapter.id} value={chapter.id}>
            <AccordionTrigger className="flex items-center justify-between px-4">
              <div className="flex items-center gap-x-2">
                <span className="text-left line-clamp-2">{chapter.title}</span>
                {chapter.isFree && (
                  <Badge variant="outline" className="bg-green-300">
                    Free
                  </Badge>
                )}
                {!chapter.isPublished && (
                  <Badge variant="destructive">Draft</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-4">
                {/* Description */}
                {chapter.description && (
                  <p className="text-sm text-muted-foreground">
                    {chapter.description}
                  </p>
                )}

                {/* Progress */}
                {chapter.userProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-x-2">
                      <BookCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {chapter.userProgress.isCompleted
                          ? "Completed"
                          : "In Progress"}
                      </span>
                    </div>
                    <Progress
                      value={chapter.userProgress.watchedSeconds}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Chapter Assets */}
                <div className="flex items-center gap-x-4 mt-2">
                  {/* Video Status */}
                  <div className="flex items-center gap-x-2">
                    <Video
                      className={`h-4 w-4 ${
                        chapter.videoUrl
                          ? "text-sky-700"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-sm">
                      {chapter.videoUrl ? "Video added" : "No video"}
                    </span>
                  </div>

                  {/* Resources Count */}
                  {chapter.resources.length > 0 && (
                    <div className="flex items-center gap-x-2">
                      {chapter.resources.map((resource) => (
                        <span key={resource.id}>
                          {getResourceIcon(resource.type)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quiz Count */}
                  {chapter.quizzes.length > 0 && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      {chapter.quizzes.length}{" "}
                      {chapter.quizzes.length === 1 ? "Quiz" : "Quizzes"}
                    </Badge>
                  )}
                </div>

                {/* Settings Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      openChapterSettingsDialog({
                        courseId,
                        chapterId: chapter?.id,
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* <ChapterSettingsDialog /> */}
    </div>
  );
}
