"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import QuizList from "./QuizList";
import TeacherQuizManager from "./TeacherQuizManager";

interface QuizTabContentProps {
  chapterId: string;
  onQuizComplete?: () => void;
}

const QuizTabContent: React.FC<QuizTabContentProps> = ({
  chapterId,
  onQuizComplete,
}) => {
  const { isTeacher, isStudent, isLoading, error } = useUserRole();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                Memuat quiz...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat informasi pengguna. Silakan refresh halaman.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isTeacher) {
    // Show teacher interface for quiz management
    return <TeacherQuizManager chapterId={chapterId} />;
  } else if (isStudent) {
    // Show student interface for taking quizzes
    return <QuizList chapterId={chapterId} onQuizComplete={onQuizComplete} />;
  } else {
    // User doesn't have teacher or student profile
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Anda perlu mendaftar sebagai teacher atau student untuk mengakses
              quiz.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
};

export default QuizTabContent;
