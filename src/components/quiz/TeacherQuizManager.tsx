"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  RefreshCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuizBuilder } from "@/hooks/use-quiz-management";
import CreateQuizDialog from "./CreateQuizDialog";
import EditQuizDialog from "./EditQuizDialog";
import DeleteQuizDialog from "./DeleteQuizDialog";
import CreateQuestionDialog from "./questions/CreateQuestionDialog";
import { useQuizDialogStore } from "@/store/use-store-quiz-dialog";
import QuestionItem from "./questions/QuestionItem";
import EditQuestionDialog from "./questions/EditQuestionDialog";
import DeleteQuestionDialog from "./questions/DeleteQuestionDialog";
import { useChapterQuery } from "@/hooks/use-chapter-query";
import { useTranslations } from "next-intl";

interface TeacherQuizManagerProps {
  chapterId: string;
}

const TeacherQuizManager: React.FC<TeacherQuizManagerProps> = ({
  chapterId,
}) => {
  const t = useTranslations("teacher_quiz");

  const params = useParams();
  const courseId = params.courseId as string;

  const { quizzes, isLoading, error, quizCount, maxQuizzesReached, refetch } =
    useQuizBuilder(chapterId);

  const { data: chapterData } = useChapterQuery({ courseId, chapterId });

  // Check if course is free
  const isFree = chapterData?.isFree;

  const {
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    openCreateQuestionDialog,
    editingQuizId,
    deletingQuizId,
  } = useQuizDialogStore();

  // Find quiz objects for dialogs
  const editingQuiz = editingQuizId
    ? quizzes.find((quiz) => quiz.id === editingQuizId) || null
    : null;

  const deletingQuiz = deletingQuizId
    ? quizzes.find((quiz) => quiz.id === deletingQuizId) || null
    : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("loading_quiz")}
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
            <AlertDescription>{t("error_loading_quiz")}</AlertDescription>
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
              <CardTitle>{t("quiz_management")}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {quizCount}/30 {t("quiz")}
              </Badge>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {t("refresh")}
              </Button>
              {!isFree && (
                <Button
                  disabled={maxQuizzesReached}
                  className="gap-2"
                  onClick={openCreateDialog}
                >
                  <Plus className="h-4 w-4" />
                  {t("create_new_quiz")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {maxQuizzesReached && (
          <CardContent className="pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t("max_quiz_reached")}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quiz List */}
        <div className="space-y-4 col-span-1 md:col-span-2">
          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t("no_quiz")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isFree
                        ? t("no_quiz_description_free")
                        : t("no_quiz_description")}
                    </p>
                    {!isFree && (
                      <Button
                        disabled={maxQuizzesReached}
                        className="gap-2"
                        onClick={openCreateDialog}
                      >
                        <Plus className="h-4 w-4" />
                        {t("create_new_quiz")}
                      </Button>
                    )}
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
                              {t("quiz_title_with_index", {
                                index: index + 1,
                                title: quiz.title,
                              })}
                            </h3>
                            <Badge variant="outline">
                              {quiz.questions?.length || 0} {t("question")}
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
                            <span>
                              {t("passing_score", { score: quiz.passingScore })}
                            </span>{" "}
                          </div>
                          {quiz.timeLimit ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {t("time_limit", { minutes: quiz.timeLimit })}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{t("no_time_limit")}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>
                              <span>
                                {t("question_count", {
                                  count: quiz.questions?.length || 0,
                                })}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Quiz Status */}
                        <div className="flex gap-2">
                          {quiz.questions?.length === 0 ? (
                            <Badge variant="secondary">
                              {t("no_questions")}
                            </Badge>
                          ) : (
                            <Badge variant="default">{t("ready")}</Badge>
                          )}
                        </div>

                        {/* Questions Accordion */}
                        {quiz.questions && quiz.questions.length > 0 && (
                          <div className="mt-4">
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full"
                            >
                              <AccordionItem value={`questions-${quiz.id}`}>
                                <AccordionTrigger className="text-sm font-medium">
                                  {t("view_questions", {
                                    count: quiz.questions.length,
                                  })}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {quiz.questions.map((question, qIndex) => (
                                      <QuestionItem
                                        key={qIndex}
                                        question={question}
                                        qIndex={qIndex}
                                      />
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreateQuestionDialog(quiz.id)}
                        >
                          <Plus className="h-4 w-4" />
                          {t("add_question")}
                        </Button>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(quiz.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t("edit_quiz")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => openDeleteDialog(quiz.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete_quiz")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">{t("tips_title")}</p>
                <ul className="space-y-2 text-xs">
                  {[
                    t("tips.0"),
                    t("tips.1"),
                    t("tips.2"),
                    t("tips.3"),
                    t("tips.4"),
                  ].map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Components */}
      <CreateQuizDialog chapterId={chapterId} />
      <EditQuizDialog quiz={editingQuiz} />
      <DeleteQuizDialog quiz={deletingQuiz} />
      <CreateQuestionDialog />
      <EditQuestionDialog />
      <DeleteQuestionDialog />
    </div>
  );
};

export default TeacherQuizManager;
