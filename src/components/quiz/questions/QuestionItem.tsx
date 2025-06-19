import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Question } from "@/lib/types";
import { useQuizDialogStore } from "@/store/use-store-quiz-dialog";
import {
  CheckCircle,
  Hash,
  HelpCircle,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import React from "react";

// Question type labels
const questionTypeLabels = {
  MULTIPLE_CHOICE: "Pilihan Ganda (Banyak Jawaban)",
  SINGLE_CHOICE: "Pilihan Ganda (Satu Jawaban)",
  TRUE_FALSE: "Benar/Salah",
  TEXT: "Teks Bebas",
  NUMBER: "Angka",
};

interface QuestionItemProps {
  question: Question;
  qIndex: number;
}

const QuestionItem = ({ question, qIndex }: QuestionItemProps) => {
  const { openEditQuestionDialog, openDeleteQuestionDialog } =
    useQuizDialogStore();

  return (
    <div key={question.id} className="bg-gray-50 border rounded-lg p-4">
      <div className="space-y-3">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Soal {qIndex + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {questionTypeLabels[question.type] || question.type}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {question.points} poin
              </div>
            </div>
            <p className="text-sm text-gray-800 font-medium">{question.text}</p>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => openEditQuestionDialog(question.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => openDeleteQuestionDialog(question.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Question Options */}
        {question.options && question.options.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Pilihan Jawaban:
            </p>
            <div className="grid gap-2">
              {question.options.map((option: any, oIndex: number) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-2 p-2 rounded text-xs ${
                    option.isCorrect
                      ? "bg-green-100 border border-green-200"
                      : "bg-white border"
                  }`}
                >
                  <span className="font-medium text-muted-foreground">
                    {String.fromCharCode(65 + oIndex)}.
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {option.isCorrect && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Explanation */}
        {question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Penjelasan:
                </p>
                <p className="text-xs text-blue-700">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionItem;
