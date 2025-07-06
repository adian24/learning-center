"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileText,
  Book,
  HelpCircle,
  ArrowLeft,
  NotebookPen,
} from "lucide-react";
import Layout from "@/layout";
import { useRouter } from "next/navigation";
import { useChapterQuery } from "@/hooks/use-chapter-query";
import { Badge } from "@/components/ui/badge";
import ContentVideo from "@/sections/chapters/detail/ContentVideo";
import QuizTabContent from "@/components/quiz/QuizTabContent";
import ChapterProgress from "@/components/quiz/ChapterProgress";
import ResourcesTabContent from "@/components/resources/ResourcesTabContent";

const DetailChapter = ({
  chapterId,
  courseId,
}: {
  chapterId: string;
  courseId: string;
}) => {
  const router = useRouter();

  const { data: chapter } = useChapterQuery({ courseId, chapterId });

  const handleProgressUpdate = () => {
    // This will trigger re-fetching of data when progress is updated
    // The queries will automatically update due to React Query invalidation
  };

  const handleQuizComplete = () => {
    // This will trigger re-fetching when quiz is completed
    // The progress tab data will automatically update
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Button variant="link" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center justify-between">
          <div className="pr-6">
            <h1 className="text-2xl font-bold line-clamp-2">
              {chapter?.title}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {chapter?.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center">
          <div className="flex items-center gap-x-2">
            {chapter?.isFree && (
              <Badge variant="outline" className="bg-green-300">
                Free
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="mt-10 w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4 lg:w-3/5">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Quiz <Badge>{chapter?.quizzes?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4" />
              Resources <Badge>{chapter?.resources?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <ContentVideo
              chapter={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <QuizTabContent
              chapterId={chapterId}
              onQuizComplete={handleQuizComplete}
            />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourcesTabContent chapterId={chapterId} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <ChapterProgress
              chapterId={chapterId}
              onProgressUpdate={handleProgressUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DetailChapter;
