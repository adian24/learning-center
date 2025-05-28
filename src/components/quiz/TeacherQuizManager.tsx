"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Trophy,
  Eye,
  AlertCircle,
  BookOpen,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuizBuilder } from "@/hooks/use-quiz-management";
import CreateQuizDialog from "./CreateQuizDialog";

interface TeacherQuizManagerProps {
  chapterId: string;
}

const TeacherQuizManager: React.FC<TeacherQuizManagerProps> = ({
  chapterId,
}) => {
  const { quizzes, isLoading, error, quizCount, maxQuizzesReached } =
    useQuizBuilder(chapterId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
              Gagal memuat daftar quiz. Silakan coba lagi.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Quiz Management</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{quizCount}/30 Quiz</Badge>
              <CreateQuizDialog
                chapterId={chapterId}
                maxQuizzesReached={maxQuizzesReached}
              />
            </div>
          </div>
        </CardHeader>
        {maxQuizzesReached && (
          <CardContent className="pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maksimal 30 quiz per chapter telah tercapai. Hapus quiz yang
                tidak diperlukan untuk membuat yang baru.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Belum Ada Quiz</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mulai dengan membuat quiz pertama untuk chapter ini.
                </p>
                <CreateQuizDialog
                  chapterId={chapterId}
                  maxQuizzesReached={maxQuizzesReached}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <Card key={quiz.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Quiz {index + 1}: {quiz.title}
                        </h3>
                        <Badge variant="outline">
                          {quiz.questions?.length || 0} soal
                        </Badge>
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    {/* Quiz Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>Passing Score: {quiz.passingScore}%</span>
                      </div>
                      {quiz.timeLimit ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Waktu: {quiz.timeLimit} menit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Tanpa batas waktu</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{quiz.questions?.length || 0} pertanyaan</span>
                      </div>
                    </div>

                    {/* Quiz Status */}
                    <div className="flex gap-2">
                      {quiz.questions?.length === 0 ? (
                        <Badge variant="secondary">Belum ada soal</Badge>
                      ) : (
                        <Badge variant="default">Siap digunakan</Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Soal
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">💡 Tips untuk Quiz:</p>
            <ul className="space-y-1 text-xs">
              <li>• Setiap quiz berkontribusi terhadap skor chapter siswa</li>
              <li>• Siswa perlu mencapai skor chapter ≥ 65% untuk lulus</li>
              <li>
                • Quiz dengan pertanyaan yang jelas akan membantu pemahaman
                siswa
              </li>
              <li>
                • Gunakan batas waktu yang sesuai dengan tingkat kesulitan
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherQuizManager;
