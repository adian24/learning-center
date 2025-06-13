import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudentQuizzes } from "@/hooks/use-quiz-management";
import { StudentQuiz } from "@/lib/types/quiz";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import React from "react";

interface StudentQuizzesProps {
  chapterId: string;
}

const StudentQuizzes = ({ chapterId }: StudentQuizzesProps) => {
  const { data: quizzes } = useStudentQuizzes(chapterId);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ChatBubbleIcon className="h-4 w-4" />
          Kuis Chapter ({quizzes?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {quizzes &&
            quizzes.map((quiz: StudentQuiz, index: number) => (
              <div key={quiz.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{quiz.title}</h4>
                    {quiz.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {quiz.questions?.length || 0} soal
                      </span>
                      {quiz.timeLimit && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {quiz.timeLimit} menit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button size="sm" className="w-full" variant="outline">
                  Ikuti Kuis
                </Button>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentQuizzes;
