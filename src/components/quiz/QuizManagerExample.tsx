"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import TeacherQuizManager from "./TeacherQuizManager";
import { useQuizDialogStore } from "@/stores/use-store-quiz-dialog";

interface QuizManagerExampleProps {
  chapterId?: string;
}

const QuizManagerExample: React.FC<QuizManagerExampleProps> = ({
  chapterId = "example-chapter-123",
}) => {
  const {
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    isCreateOpen,
    isEditOpen,
    isDeleteOpen,
    resetAllDialogs,
  } = useQuizDialogStore();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Dialog Management dengan Zustand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={openCreateDialog}
              className="gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              Open Create
            </Button>

            <Button
              onClick={() => openEditDialog("quiz-example-1")}
              className="gap-2"
              variant="outline"
            >
              <Edit className="h-4 w-4" />
              Open Edit
            </Button>

            <Button
              onClick={() => openDeleteDialog("quiz-example-1")}
              className="gap-2"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              Open Delete
            </Button>

            <Button onClick={resetAllDialogs} variant="secondary">
              Reset All
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>State Management:</strong>
            </p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Create Dialog: {isCreateOpen ? "Open" : "Closed"}</li>
              <li>Edit Dialog: {isEditOpen ? "Open" : "Closed"}</li>
              <li>Delete Dialog: {isDeleteOpen ? "Open" : "Closed"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actual Quiz Manager */}
      <TeacherQuizManager chapterId={chapterId} />
    </div>
  );
};

export default QuizManagerExample;
