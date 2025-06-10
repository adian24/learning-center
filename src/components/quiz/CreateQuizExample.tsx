"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateQuizDialog from "./CreateQuizDialog";
import { useQuizDialogStore } from "@/store/use-store-quiz-dialog";

interface CreateQuizExampleProps {
  chapterId?: string;
}

const CreateQuizExample: React.FC<CreateQuizExampleProps> = ({
  chapterId = "example-chapter-id",
}) => {
  const { openCreateDialog } = useQuizDialogStore();

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Create Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Klik tombol di bawah untuk mencoba membuat quiz baru.
          </p>

          <div className="space-y-2">
            {/* Normal button */}
            <Button onClick={openCreateDialog} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Buat Quiz Baru (Normal)
            </Button>

            {/* Disabled button */}
            <Button disabled={true} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Buat Quiz Baru (Disabled)
            </Button>

            {/* Max quizzes reached button */}
            <Button disabled={true} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Buat Quiz Baru (Max Reached)
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Tombol pertama: Normal state</p>
            <p>• Tombol kedua: Disabled state</p>
            <p>• Tombol ketiga: Max quizzes reached</p>
          </div>
        </CardContent>
      </Card>

      {/* Render the dialog separately */}
      <CreateQuizDialog chapterId={chapterId} />
    </>
  );
};

export default CreateQuizExample;
