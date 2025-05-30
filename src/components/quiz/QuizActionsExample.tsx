"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Eye } from "lucide-react";
import EditQuizDialog from "./EditQuizDialog";
import DeleteQuizDialog from "./DeleteQuizDialog";
import { Quiz, QuestionType } from "@/lib/types";

interface QuizActionsExampleProps {
  chapterId?: string;
}

const QuizActionsExample: React.FC<QuizActionsExampleProps> = ({
  chapterId = "example-chapter-id",
}) => {
  // Example quiz data for demonstration
  const exampleQuiz: Quiz = {
    id: "example-quiz-id",
    title: "Quiz Pemahaman Dasar JavaScript",
    description: "Quiz untuk menguji pemahaman konsep dasar JavaScript",
    timeLimit: 30,
    passingScore: 70,
    chapterId: chapterId,
    createdAt: new Date(),
    updatedAt: new Date(),
    chapter: {
      id: chapterId,
      title: "Chapter Example",
      position: 1,
      isPublished: true,
      isFree: false,
      courseId: "course-example",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    questions: [
      {
        id: "q1",
        text: "Apa itu JavaScript?",
        type: QuestionType.MULTIPLE_CHOICE,
        points: 10,
        quizId: "example-quiz-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        quiz: {} as Quiz, // Circular reference placeholder
        options: [
          {
            id: "o1",
            text: "Bahasa pemrograman",
            isCorrect: true,
            questionId: "q1",
            question: {} as any, // Circular reference placeholder
          },
        ],
      },
    ],
  };

  const emptyQuiz: Quiz = {
    id: "empty-quiz-id",
    title: "Quiz Tanpa Soal",
    description: "Quiz yang belum memiliki pertanyaan",
    timeLimit: null,
    passingScore: 60,
    chapterId: chapterId,
    createdAt: new Date(),
    updatedAt: new Date(),
    chapter: {
      id: chapterId,
      title: "Chapter Example",
      position: 1,
      isPublished: true,
      isFree: false,
      courseId: "course-example",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    questions: [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Demo Edit & Delete Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Berikut adalah demo untuk fungsi edit dan delete quiz. Klik tombol
            di bawah untuk mencoba.
          </p>

          <div className="space-y-6">
            {/* Quiz with Questions */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Quiz 1: {exampleQuiz.title}
                        </h3>
                        <Badge variant="outline">
                          {exampleQuiz.questions?.length || 0} soal
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exampleQuiz.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>Passing Score: {exampleQuiz.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Waktu: {exampleQuiz.timeLimit} menit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {exampleQuiz.questions?.length || 0} pertanyaan
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="default">Siap digunakan</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <EditQuizDialog quiz={exampleQuiz} />
                    <DeleteQuizDialog quiz={exampleQuiz} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz without Questions */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Quiz 2: {emptyQuiz.title}
                        </h3>
                        <Badge variant="outline">
                          {emptyQuiz.questions?.length || 0} soal
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {emptyQuiz.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>Passing Score: {emptyQuiz.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Tanpa batas waktu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {emptyQuiz.questions?.length || 0} pertanyaan
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary">Belum ada soal</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <EditQuizDialog quiz={emptyQuiz} />
                    <DeleteQuizDialog quiz={emptyQuiz} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🔧 Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Edit Quiz:</strong> Form pre-populated dengan data
                quiz existing
              </li>
              <li>
                • <strong>Delete Quiz:</strong> Konfirmasi dengan mengetik
                &quot;HAPUS&quot;
              </li>
              <li>
                • <strong>Loading States:</strong> Button disabled dan loading
                spinner
              </li>
              <li>
                • <strong>Toast Feedback:</strong> Success/error notifications
              </li>
              <li>
                • <strong>Form Validation:</strong> Real-time validation dengan
                error messages
              </li>
              <li>
                • <strong>Safety Checks:</strong> Warning untuk quiz yang sudah
                memiliki soal
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizActionsExample;
