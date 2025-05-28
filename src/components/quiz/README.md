# Quiz Components Documentation

## Overview

Sistem quiz yang lengkap dengan kemampuan membuat, mengelola, dan mengerjakan quiz. Sistem ini mendukung role-based access untuk teacher dan student.

## Components

### 1. CreateQuizDialog

Dialog untuk membuat quiz baru dengan form validation dan loading states.

**Features:**

- Form validation untuk semua field
- Loading indicator saat submit
- Toast notifications untuk success/error
- Support untuk time limit dan passing score
- Auto-reset form setelah berhasil
- Disabled state handling

**Props:**

```typescript
interface CreateQuizDialogProps {
  chapterId: string; // Required: ID chapter
  disabled?: boolean; // Optional: Disable button
  maxQuizzesReached?: boolean; // Optional: Max quiz limit reached
}
```

**Usage:**

```tsx
<CreateQuizDialog
  chapterId="chapter-123"
  disabled={false}
  maxQuizzesReached={false}
/>
```

### 2. TeacherQuizManager

Komponen manajemen quiz untuk teacher dengan daftar quiz dan tombol create.

**Features:**

- Daftar semua quiz dalam chapter
- Tombol create quiz terintegrasi
- Quiz counter dan limit tracking
- Action menu untuk setiap quiz
- Empty state dengan CTA
- Tips dan informasi untuk teacher

**Props:**

```typescript
interface TeacherQuizManagerProps {
  chapterId: string;
}
```

### 3. QuizTabContent

Wrapper component yang mendeteksi user role dan menampilkan interface yang sesuai.

**Features:**

- Auto-detect user role (teacher/student)
- Conditional rendering berdasarkan role
- Loading states dan error handling
- Seamless integration dengan chapter detail

**Props:**

```typescript
interface QuizTabContentProps {
  chapterId: string;
  onQuizComplete?: () => void;
}
```

### 4. useUserRole Hook

Custom hook untuk mendeteksi role user berdasarkan profile.

**Returns:**

```typescript
{
  role: "TEACHER" | "STUDENT" | null;
  profile: any;
  isTeacher: boolean;
  isStudent: boolean;
  isLoading: boolean;
  error: any;
}
```

## API Endpoints

### POST /api/teacher/quizzes

Membuat quiz baru (teacher only).

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  timeLimit?: number;    // in minutes
  passingScore: number;  // 1-100
  chapterId: string;
}
```

### GET /api/me

Mengembalikan informasi user dengan role detection.

**Response:**

```typescript
{
  id: string;
  name: string;
  email: string;
  role: "TEACHER" | "STUDENT" | null;
  profile: TeacherProfile | StudentProfile | null;
}
```

## Form Validation

### Quiz Creation Form

- **Title**: Required, tidak boleh kosong
- **Description**: Optional
- **Time Limit**: Optional, minimal 1 menit jika diisi
- **Passing Score**: Required, antara 1-100

## Toast Notifications

### Success Messages

- "Quiz Berhasil Dibuat" - Saat quiz berhasil dibuat
- Menampilkan nama quiz yang dibuat

### Error Messages

- "Gagal Membuat Quiz" - Saat terjadi error
- Menampilkan detail error dari server

## States & Loading

### Loading States

- Spinner dengan text "Membuat..." saat submit
- Full page loading saat fetch data
- Button disabled selama loading

### Error States

- Form validation errors per field
- API error handling dengan toast
- Network error fallbacks

## Integration

### Chapter Detail Page

```tsx
import QuizTabContent from "@/components/quiz/QuizTabContent";

// Di dalam Tabs
<TabsContent value="quiz">
  <QuizTabContent chapterId={chapterId} onQuizComplete={handleQuizComplete} />
</TabsContent>;
```

### Testing Component

```tsx
import CreateQuizExample from "@/components/quiz/CreateQuizExample";

// Untuk testing dialog
<CreateQuizExample chapterId="test-chapter" />;
```

## Business Rules

1. **Quiz Limits:**

   - Maksimal 30 quiz per chapter
   - Teacher tidak bisa create quiz jika limit tercapai

2. **Role Access:**

   - Teacher: Melihat TeacherQuizManager dengan tombol create
   - Student: Melihat QuizList untuk mengerjakan quiz
   - No role: Error message dengan instruction

3. **Chapter Integration:**
   - Quiz terintegrasi dengan chapter progress
   - Score calculation otomatis
   - Real-time updates antar tabs

## Styling

- Menggunakan Tailwind CSS dengan Shadcn/UI components
- Consistent spacing dan typography
- Responsive design
- Loading states dengan proper animations
- Error states dengan clear messaging

## Future Enhancements

1. **Question Management:**

   - Dialog untuk membuat pertanyaan
   - Support multiple question types
   - Bulk question import

2. **Quiz Analytics:**

   - Statistics per quiz
   - Student performance tracking
   - Difficulty analysis

3. **Advanced Features:**
   - Quiz scheduling
   - Randomized questions
   - Time-based availability
