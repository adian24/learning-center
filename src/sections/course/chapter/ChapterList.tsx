// components/chapters/chapter-list.tsx
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Video,
  FileText,
  Link,
  FileBox,
  Settings,
  BookCheck,
  Delete,
  Trash2,
  Pencil
} from 'lucide-react';
import { useSettingChapterStore } from '@/store/use-store-setting-chapter';
import { useEditChapterStore } from '@/store/use-store-edit-chapter';
import { Chapter } from '@/lib/types';
import { useDeleteChapterStore } from '@/store/use-store-delete-chapter';
// import { ChapterSettingsDialog } from "./chapter-settings-dialog";
// import { useDialogStore } from "@/store/dialog-store";

interface Resource {
  id: string;
  type: 'PDF' | 'LINK' | 'FILE';
}



interface ChapterListProps {
  courseId: string;
}

export function ChapterList({ courseId }: ChapterListProps) {
  const openChapterSettingsDialog = useSettingChapterStore(
    (state) => state.onOpen
  );
  const openEditChapterDialog = useEditChapterStore(
    (state) => state.onOpen
  );
  const openDeleteChapterDialog = useDeleteChapterStore(
    (state) => state.onOpen
  );

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/courses/${courseId}/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return response.json();
    }
  });

  if (isLoading) {
    return <div>Loading chapters...</div>;
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'LINK':
        return <Link className="h-4 w-4" />;
      case 'FILE':
        return <FileBox className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="my-4 w-full space-y-2">
        {chapters?.map((chapter: Chapter) => (
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
                    Free
                  </Badge>
                )}
                {!chapter.isPublished && (
                  <Badge variant="default" className="bg-orange-400">
                    Draft
                  </Badge>
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

                {/* Chapter Assets */}
                <div className="flex items-center gap-x-4 mt-2">
                  {/* Video Status */}
                  <div className="flex items-center gap-x-2">
                    <Video
                      className={`h-4 w-4 ${chapter.videoUrl
                        ? 'text-sky-700'
                        : 'text-muted-foreground'
                        }`}
                    />
                    <span className="text-sm">
                      {chapter.videoUrl ? 'Video added' : 'No video'}
                    </span>
                  </div>

                  {/* Resources Count */}
                  {chapter.resources && (
                    <div className="flex items-center gap-x-2">
                      {chapter.resources.map((resource) => (
                        <span key={resource.id}>
                          {getResourceIcon(resource.type)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quiz Count */}
                  {chapter.quizzes && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      {chapter.quizzes.length}{' '}
                      {chapter.quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                    </Badge>
                  )}
                </div>

                {/* Settings Button */}
                <div className="flex justify-end items-center mt-4 gap-2">
                  <Button
                    onClick={() => {
                      openChapterSettingsDialog({
                        courseId,
                        chapterId: chapter?.id
                      });
                    }}
                    variant="outline"
                    size="sm"
                    type='button'
                  >
                    <Settings />
                    Settings
                  </Button>
                  <Button
                    onClick={() => {
                      openEditChapterDialog(chapter);
                    }}
                    size="sm" variant="outline" type='button'>
                    <Pencil />
                    Edit Chapter
                  </Button>
                  <Button onClick={() => {
                    openDeleteChapterDialog(chapter);
                  }}
                    size="sm"
                    variant="outline"
                    type='button'>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
