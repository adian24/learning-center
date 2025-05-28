# Quiz Scoring System Implementation

## Overview

Sistem penilaian quiz baru yang mengintegrasikan skor quiz dengan progres chapter. Setiap chapter memiliki nilai akhir berdasarkan performa quiz, dan siswa harus mencapai skor minimal 65% untuk dapat melanjutkan ke chapter berikutnya.

## Schema Changes

### UserProgress Model

```prisma
model UserProgress {
  // ... existing fields ...
  chapterScore Float?    // Overall quiz score for the chapter (0-100)
  // ... existing fields ...
}
```

## Key Features

### 1. Chapter Scoring System

- **Skor Chapter**: 0-100 berdasarkan persentase quiz yang berhasil diselesaikan
- **Rumus**: `(passedQuizzes / totalQuizzes) * 100`
- **Kriteria Lulus Quiz**: Skor quiz individual >= `Quiz.passingScore`
- **Kriteria Lulus Chapter**: Skor chapter >= 65%

### 2. Progression Control

- Siswa tidak dapat melanjutkan ke chapter berikutnya jika skor chapter < 65%
- Sistem otomatis mengupdate `UserProgress.isCompleted` berdasarkan skor quiz
- Siswa harus mengulang quiz sampai mencapai skor minimal

### 3. Multiple Quiz Support

- Maksimal 30 quiz per chapter
- Setiap quiz berkontribusi sama terhadap skor chapter (weighted equally)
- Quiz individual tetap memiliki `passingScore` sendiri

## API Endpoints

### Student Endpoints

#### Submit Quiz Attempt

```typescript
POST /api/student/quiz-attempts
{
  "quizId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedOptionId": "string", // for multiple choice
      "textAnswer": "string"        // for text answers
    }
  ]
}

Response:
{
  "message": "Quiz attempt submitted successfully",
  "attempt": QuizAttempt,
  "score": number,
  "passed": boolean
}
```

#### Get Quiz Attempts

```typescript
GET /api/student/quiz-attempts?quizId={id}
GET /api/student/quiz-attempts?chapterId={id}

Response:
{
  "attempts": QuizAttempt[]
}
```

#### Get Chapter Progress

```typescript
GET /api/student/chapter-progress?chapterId={id}

Response:
{
  "progress": UserProgress | null,
  "calculation": ChapterScoreCalculation,
  "hasProgress": boolean
}
```

#### Check Can Proceed

```typescript
GET /api/student/chapter-progress?chapterId={id}&action=can-proceed

Response:
{
  "canProceed": boolean,
  "chapterId": string,
  "message": string
}
```

#### Get Course Progress

```typescript
GET /api/student/chapter-progress?courseId={id}

Response:
{
  "courseProgress": [
    {
      "chapterId": string,
      "chapterTitle": string,
      "position": number,
      "userProgress": UserProgress | null,
      "calculation": ChapterScoreCalculation,
      "quizzes": QuizInfo[]
    }
  ],
  "courseId": string
}
```

### Updated Progress Endpoint

```typescript
POST /api/progress
{
  "chapterId": "string",
  "watchedSeconds": number,
  "isCompleted": boolean,  // Will be validated against quiz scores
  "notes": "string"
}

Response:
{
  "message": "Progress updated successfully",
  "progress": UserProgress,
  "chapterScore": number,
  "quizSummary": {
    "totalQuizzes": number,
    "passedQuizzes": number,
    "isCompleted": boolean
  }
}
```

## React Hooks

### Quiz Management (Student)

#### useQuizAttempts

```typescript
import { useQuizAttempts, useSubmitQuizAttempt } from '@/hooks/use-quiz-attempts';

function QuizComponent({ quizId }: { quizId: string }) {
  const { data: attempts, isLoading } = useQuizAttempts({ quizId });
  const submitAttempt = useSubmitQuizAttempt();

  const handleSubmit = async (answers: Answer[]) => {
    try {
      const result = await submitAttempt.mutateAsync({
        quizId,
        answers
      });

      if (result.passed) {
        // Quiz passed
        console.log(`Score: ${result.score}%`);
      } else {
        // Quiz failed, can retry
        console.log(`Failed with score: ${result.score}%`);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  return (
    // Your quiz UI
  );
}
```

#### useChapterProgress

```typescript
import { useChapterStatus } from "@/hooks/use-chapter-progress";

function ChapterComponent({ chapterId }: { chapterId: string }) {
  const {
    chapterScore,
    isCompleted,
    canProceed,
    totalQuizzes,
    passedQuizzes,
    isLoading,
  } = useChapterStatus(chapterId);

  return (
    <div>
      <p>Chapter Score: {chapterScore}%</p>
      <p>
        Quizzes Passed: {passedQuizzes}/{totalQuizzes}
      </p>
      <p>Can Proceed: {canProceed ? "Yes" : "No"}</p>
      {!canProceed && <p>Complete more quizzes to reach 65% score</p>}
    </div>
  );
}
```

#### useCourseOverview

```typescript
import { useCourseOverview } from "@/hooks/use-chapter-progress";

function CourseOverview({ courseId }: { courseId: string }) {
  const { courseProgress, stats, isLoading } = useCourseOverview(courseId);

  return (
    <div>
      <h2>Course Progress</h2>
      <p>Completion: {stats.completionPercentage}%</p>
      <p>Average Score: {stats.averageScore}%</p>
      <p>
        Completed Chapters: {stats.completedChapters}/{stats.totalChapters}
      </p>

      {courseProgress.map((chapter) => (
        <div key={chapter.chapterId}>
          <h3>{chapter.chapterTitle}</h3>
          <p>Score: {chapter.calculation.chapterScore}%</p>
          <p>
            Status:{" "}
            {chapter.calculation.isCompleted ? "Completed" : "In Progress"}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Quiz Management (Teacher)

#### useQuizBuilder

```typescript
import { useQuizBuilder } from "@/hooks/use-quiz-management";

function TeacherQuizManager({ chapterId }: { chapterId: string }) {
  const { quizzes, quizCount, maxQuizzesReached, createQuiz, isCreatingQuiz } =
    useQuizBuilder(chapterId);

  const handleCreateQuiz = async () => {
    if (maxQuizzesReached) {
      alert("Maximum 30 quizzes per chapter");
      return;
    }

    try {
      await createQuiz({
        title: "New Quiz",
        passingScore: 60,
        chapterId,
      });
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  return (
    <div>
      <p>Quizzes: {quizCount}/30</p>
      <button
        onClick={handleCreateQuiz}
        disabled={maxQuizzesReached || isCreatingQuiz}
      >
        Create Quiz
      </button>

      {quizzes.map((quiz) => (
        <div key={quiz.id}>
          <h3>{quiz.title}</h3>
          <p>Passing Score: {quiz.passingScore}%</p>
        </div>
      ))}
    </div>
  );
}
```

## Service Functions

### ChapterScoreCalculation

```typescript
import {
  calculateChapterScore,
  updateUserProgressScore,
  canProceedToNextChapter,
} from "@/lib/services/quiz-score-service";

// Calculate score for a chapter
const calculation = await calculateChapterScore(studentId, chapterId);
console.log(calculation);
// {
//   chapterId: "...",
//   studentId: "...",
//   totalQuizzes: 4,
//   passedQuizzes: 3,
//   chapterScore: 75,
//   isCompleted: true
// }

// Update user progress with calculated score
await updateUserProgressScore(studentId, chapterId);

// Check if can proceed
const canProceed = await canProceedToNextChapter(studentId, chapterId);
```

## Business Logic Examples

### Scenario 1: Chapter dengan 10 Quiz

- 7 quiz berhasil dilulus (score >= passingScore)
- Chapter score: (7/10) \* 100 = 70%
- Status: **DAPAT** melanjutkan ke chapter berikutnya (≥ 65%)

### Scenario 2: Chapter dengan 4 Quiz

- 2 quiz berhasil dilulus
- Chapter score: (2/4) \* 100 = 50%
- Status: **TIDAK DAPAT** melanjutkan (< 65%)
- Aksi: Siswa harus mengulang quiz sampai minimal 3 quiz lulus (75%)

### Scenario 3: Chapter tanpa Quiz

- Chapter score: 100%
- Status: **DAPAT** melanjutkan (tidak ada quiz requirement)

## Error Handling

### Quiz Submission Errors

```typescript
try {
  await submitQuizAttempt.mutateAsync({ quizId, answers });
} catch (error) {
  // Handle submission errors
  console.error("Quiz submission failed:", error.message);
}
```

### Progress Update Errors

```typescript
try {
  await updateProgress.mutateAsync({
    chapterId,
    isCompleted: true,
  });
} catch (error) {
  if (error.message.includes("Cannot complete chapter")) {
    // Show message about insufficient quiz score
    alert("You need to score at least 65% on quizzes to complete this chapter");
  }
}
```

## Database Migration

Setelah update schema, jalankan:

```bash
npx prisma generate
npx prisma db push
```

## Testing Scenarios

1. **Quiz Creation**: Teacher membuat quiz dengan berbagai tipe soal
2. **Quiz Submission**: Student mengerjakan quiz dan mendapat skor
3. **Chapter Completion**: Test validasi skor minimal 65%
4. **Progress Blocking**: Test bahwa student tidak bisa lanjut jika skor < 65%
5. **Multiple Attempts**: Test bahwa student bisa mengulang quiz
6. **Score Calculation**: Test kalkulasi skor chapter dengan berbagai kombinasi

## Next Steps untuk UI

Setelah backend dan hooks siap, Anda bisa:

1. **Update Chapter Player**: Tampilkan skor chapter dan status quiz
2. **Quiz Taking Interface**: Buat komponen untuk mengerjakan quiz
3. **Progress Indicators**: Tampilkan progress bar dengan skor
4. **Quiz Management UI**: Interface untuk teacher membuat/edit quiz
5. **Error Messages**: Tampilkan pesan ketika tidak bisa lanjut chapter

## Notes

- Sistem ini backward compatible dengan data existing
- Quiz score dihitung real-time setiap ada attempt baru
- UserProgress.isCompleted sekarang tergantung pada quiz performance
- Maximum 30 quiz per chapter (enforced di application layer)
- Minimum chapter score 65% (configurable di service layer)
