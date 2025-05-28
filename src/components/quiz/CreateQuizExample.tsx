"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateQuizDialog from "./CreateQuizDialog";

interface CreateQuizExampleProps {
  chapterId?: string;
}

const CreateQuizExample: React.FC<CreateQuizExampleProps> = ({
  chapterId = "example-chapter-id",
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Create Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Klik tombol di bawah untuk mencoba membuat quiz baru.
        </p>

        <div className="space-y-2">
          <CreateQuizDialog
            chapterId={chapterId}
            disabled={false}
            maxQuizzesReached={false}
          />

          <CreateQuizDialog
            chapterId={chapterId}
            disabled={true}
            maxQuizzesReached={false}
          />

          <CreateQuizDialog
            chapterId={chapterId}
            disabled={false}
            maxQuizzesReached={true}
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Tombol pertama: Normal state</p>
          <p>• Tombol kedua: Disabled state</p>
          <p>• Tombol ketiga: Max quizzes reached</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateQuizExample;
