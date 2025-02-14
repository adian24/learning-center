import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  FileText,
  Link,
  FileBox,
  Trash2,
  Pencil,
  FileQuestion,
  Plus,
  PlayCircle,
  MoveUpRight
} from 'lucide-react';
import { useEditChapterStore } from '@/store/use-store-edit-chapter';
import { Chapter } from '@/lib/types';
import { useDeleteChapterStore } from '@/store/use-store-delete-chapter';
import { Separator } from '@/components/ui/separator';
import { useChaptersQuery } from '@/hooks/use-chapters-query';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  type: 'PDF' | 'LINK' | 'FILE';
}

interface ChapterListProps {
  courseId: string;
}

export function ChapterList({ courseId }: ChapterListProps) {
  const router = useRouter();

  const openEditChapterDialog = useEditChapterStore((state) => state.onOpen);
  const openDeleteChapterDialog = useDeleteChapterStore(
    (state) => state.onOpen
  );

  const { data: chapters, isLoading } = useChaptersQuery({
    courseId,
    page: 1,
    limit: 3
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

                {/* Video Section */}
                <div className="space-y-2 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Video Pembelajaran</h3>
                    <Button
                      // onClick={() => handleAddVideo(chapter.id)}
                      className="text-blue-600 hover:text-blue-900"
                      variant="link"
                      size="sm"
                      type="button"
                    >
                      {chapter.videoUrl ? (
                        <>
                          <PlayCircle />
                          Update Video
                        </>
                      ) : (
                        <>
                          <Plus />
                          Add Video
                        </>
                      )}
                    </Button>
                  </div>
                  {chapter.videoUrl ? (
                    <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                      <Video className="text-sky-700" />
                      Video telah ditambahkan
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada video untuk chapter ini
                    </p>
                  )}
                </div>

                <Separator />

                {/* Quiz Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Quiz</h3>
                    <Button
                      // onClick={() => handleAddQuiz(chapter.id)}
                      className="text-blue-600 hover:text-blue-900"
                      variant="link"
                      size="sm"
                      type="button"
                    >
                      <Plus />
                      Add Quiz
                    </Button>
                  </div>
                  {chapter.quizzes && chapter.quizzes.length > 0 ? (
                    <div className="space-y-2">
                      {chapter.quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                        >
                          <div className="flex items-center gap-x-2">
                            <FileQuestion />
                            <span className="text-sm">{quiz.title}</span>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <Button
                              // onClick={() => handleEditQuiz(chapter.id, quiz.id)}
                              variant="ghost"
                              size="sm"
                              type="button"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              // onClick={() => handleDeleteQuiz(chapter.id, quiz.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              type="button"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada quiz untuk chapter ini
                    </p>
                  )}
                </div>

                <Separator />

                {/* Resources Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Resources</h3>
                    <Button
                      // onClick={() => handleAddResource(chapter.id)}
                      className="text-blue-600 hover:text-blue-900"
                      variant="link"
                      size="sm"
                      type="button"
                    >
                      <Plus />
                      Add Resource
                    </Button>
                  </div>
                  {chapter.resources && chapter.resources.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {chapter.resources.map((resource: Resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                        >
                          <div className="flex items-center gap-x-2">
                            {getResourceIcon(resource.type)}
                            {/* <span className="text-sm">{resource.title}</span> */}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            type="button"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada resource untuk chapter ini
                    </p>
                  )}
                </div>

                <Separator />

                {/* Settings Button */}
                <div className="flex justify-end items-center mt-4 gap-2">
                  <Button
                    onClick={() => {
                      openEditChapterDialog(chapter);
                    }}
                    size="sm"
                    variant="outline"
                    type="button"
                  >
                    <Pencil />
                    Edit Chapter
                  </Button>
                  <Button
                    onClick={() => {
                      openDeleteChapterDialog(chapter);
                    }}
                    size="sm"
                    variant="outline"
                    type="button"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-center mt-8">
        <Button
          variant="link"
          size={'sm'}
          type="button"
          className="underline text-blue-600 hover:text-blue-900"
          onClick={() => router.push(`/teacher/courses/${courseId}/chapters`)}
        >
          Lihat semua Chapters ({chapters?.metadata.totalChapters}){' '}
          <MoveUpRight />
        </Button>
      </div>
    </div>
  );
}
