"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  PlayCircle,
  FileText,
  Book,
  HelpCircle,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import Layout from "@/layout";
import { useRouter } from "next/navigation";
import { useChapterQuery } from "@/hooks/use-chapter-query";
import { Badge } from "@/components/ui/badge";
import { useDeleteChapterStore } from "@/store/use-store-delete-chapter";

const DetailChapter = ({
  chapterId,
  courseId,
}: {
  chapterId: string;
  courseId: string;
}) => {
  const router = useRouter();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any>({});

  const openDeleteChapterDialog = useDeleteChapterStore(
    (state) => state.onOpen
  );

  const { data: chapter } = useChapterQuery({ courseId, chapterId });

  console.log("chapter : ", chapter);

  // Mock data - in real app would come from API/props
  const mockChapter = {
    id: "1",
    title: "Chapter 1: Introduction",
    description: "Learn the basics of the course",
    videoUrl: "https://example.com/video.mp4",
    duration: 45,
    resources: [
      { id: "1", title: "Reading Material", type: "PDF" },
      { id: "2", title: "Additional Links", type: "LINK" },
    ],
    quiz: {
      id: "1",
      title: "Chapter Quiz",
      questions: [
        {
          id: "1",
          text: "What is the main concept covered in this chapter?",
          type: "MULTIPLE_CHOICE",
          options: [
            { id: "1", text: "Option A" },
            { id: "2", text: "Option B" },
            { id: "3", text: "Option C" },
          ],
        },
      ],
    },
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Button variant="link" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center justify-between mt-4">
          <div className="pr-6">
            <h1 className="text-2xl font-bold line-clamp-2">
              {chapter?.title}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {chapter?.description}
            </p>
          </div>
          <Button
            variant={"destructive"}
            onClick={() => {
              openDeleteChapterDialog(chapter);
            }}
          >
            <Trash2 />
            Hapus
          </Button>
        </div>

        <div className="mt-3 flex items-center">
          <div className="flex items-center gap-x-2">
            {chapter?.isFree && (
              <Badge variant="outline" className="bg-green-300">
                Free
              </Badge>
            )}
            {!chapter?.isPublished && (
              <Badge variant="default" className="bg-orange-400">
                Draft
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="mt-10 w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <PlayCircle className="w-16 h-16 text-blue-500" />
                </div>
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">
                    Chapter Content
                  </h3>
                  <p className="text-gray-600">{mockChapter.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {mockChapter.quiz.title}
                    </h3>
                    <Progress value={33} className="w-1/3" />
                  </div>

                  {mockChapter.quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg ${
                        index === activeQuestionIndex ? "border-blue-500" : ""
                      }`}
                    >
                      <p className="font-medium mb-4">{question.text}</p>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <Button
                            key={option.id}
                            variant={
                              userAnswers[question.id] === option.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-start"
                            onClick={() =>
                              setUserAnswers({
                                ...userAnswers,
                                [question.id]: option.id,
                              })
                            }
                          >
                            {option.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={
                        activeQuestionIndex ===
                        mockChapter.quiz.questions.length - 1
                      }
                      onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockChapter.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span>{resource.title}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Overall Progress</h4>
                    <Progress value={66} className="w-full" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Quiz Scores</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span>Quiz 1</span>
                        <span className="font-medium">80%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DetailChapter;
