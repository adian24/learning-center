# Quiz Components Documentation

## Overview

Sistem quiz yang lengkap dengan kemampuan membuat, mengelola, dan mengerjakan quiz. Sistem ini mendukung role-based access untuk teacher dan student dengan full CRUD operations. Semua form menggunakan **react-hook-form** dengan **zod validation** dan state management menggunakan **Zustand store** untuk performa dan UX yang lebih baik.

## Recent Updates

### v3.0 - Zustand State Management

- ✅ **Centralized State Management**: Migrated dari local useState ke **Zustand store**
- ✅ **No More Props Drilling**: Dialog state dikelola secara global
- ✅ **Better Performance**: Reduced re-renders dengan external state management
- ✅ **Cleaner Architecture**: Dialog triggers dipisah dari dialog components
- ✅ **Multiple Dialog Support**: Handle multiple dialogs simultaneously tanpa conflict

### v2.0 - React Hook Form Integration

- ✅ Migrated to **react-hook-form** dengan **zod validation**
- ✅ Fixed DialogContent warning dengan **DialogDescription**
- ✅ Improved form performance dan validation
- ✅ Better type safety dan error handling
- ✅ Eliminated infinite loop issues

## Architecture

### State Management dengan Zustand

Sistem menggunakan **Zustand store** untuk centralized state management:

```typescript
// stores/use-store-quiz-dialog.ts
export const useQuizDialogStore = create<QuizDialogState>((set) => ({
  // Create Quiz Dialog
  isCreateOpen: false,
  openCreateDialog: () => set({ isCreateOpen: true }),
  closeCreateDialog: () => set({ isCreateOpen: false }),

  // Edit Quiz Dialog
  isEditOpen: false,
  editingQuizId: string | null,
  openEditDialog: (quizId: string) =>
    set({ isEditOpen: true, editingQuizId: quizId }),
  closeEditDialog: () => set({ isEditOpen: false, editingQuizId: null }),

  // Delete Quiz Dialog
  isDeleteOpen: false,
  deletingQuizId: string | null,
  openDeleteDialog: (quizId: string) =>
    set({ isDeleteOpen: true, deletingQuizId: quizId }),
  closeDeleteDialog: () => set({ isDeleteOpen: false, deletingQuizId: null }),

  // Reset all states
  resetAllDialogs: () =>
    set({
      /* reset all */
    }),
}));
```

**Benefits:**

- **No useState in Components**: Dialog components fokus hanya pada UI logic
- **Centralized Control**: Parent component mengontrol semua dialog states
- **Performance**: Hanya components yang subscribe ke specific state yang re-render
- **Persistence**: State bisa di-persist atau di-sync antar components
- **Debug Friendly**: Easy debugging dengan Zustand DevTools

## Components

### 1. CreateQuizDialog

Dialog untuk membuat quiz baru dengan **react-hook-form** validation dan **Zustand state**.

**Features:**

- **No Local State**: Menggunakan `useQuizDialogStore()` untuk state management
- **React Hook Form** dengan zod schema validation
- Real-time form validation dengan proper error messages
- Loading indicator saat submit dengan proper disabled states
- Toast notifications untuk success/error feedback
- **No DialogTrigger**: Dialog triggered externally melalui Zustand actions

**Props (Simplified):**

```typescript
interface CreateQuizDialogProps {
  chapterId: string; // Required: ID chapter saja
  // Removed: disabled, maxQuizzesReached, trigger
}
```

**Usage:**

```tsx
// In parent component
const { openCreateDialog } = useQuizDialogStore();

// Button to trigger
<Button onClick={openCreateDialog}>Buat Quiz</Button>

// Dialog component (renders based on store state)
<CreateQuizDialog chapterId="chapter-123" />
```

### 2. EditQuizDialog

Dialog untuk mengedit quiz existing dengan **Zustand state management**.

**Features:**

- **No Local State**: Menggunakan `useQuizDialogStore()` untuk state management
- **Quiz Selection**: Quiz object di-provide berdasarkan `editingQuizId` dari store
- Form pre-populated dengan data quiz existing
- **No DialogTrigger**: Dialog triggered externally melalui Zustand actions
- Auto-reset form jika cancel atau close dialog

**Props (Simplified):**

```typescript
interface EditQuizDialogProps {
  quiz: Quiz | null; // Quiz object atau null jika tidak ada yang diedit
  // Removed: trigger prop
}
```

**Usage:**

```tsx
// In parent component
const { openEditDialog, editingQuizId } = useQuizDialogStore();
const editingQuiz = editingQuizId
  ? quizzes.find(quiz => quiz.id === editingQuizId) || null
  : null;

// Button to trigger
<Button onClick={() => openEditDialog(quiz.id)}>Edit Quiz</Button>

// Dialog component (renders based on store state)
<EditQuizDialog quiz={editingQuiz} />
```

### 3. DeleteQuizDialog

Dialog konfirmasi untuk menghapus quiz dengan **Zustand state management**.

**Features:**

- **No Local State**: Menggunakan `useQuizDialogStore()` untuk state management
- **Quiz Selection**: Quiz object di-provide berdasarkan `deletingQuizId` dari store
- Konfirmasi dengan mengetik "HAPUS" (local state untuk confirmation only)
- **No DialogTrigger**: Dialog triggered externally melalui Zustand actions

**Props (Simplified):**

```typescript
interface DeleteQuizDialogProps {
  quiz: Quiz | null; // Quiz object atau null jika tidak ada yang dihapus
  // Removed: trigger prop
}
```

**Usage:**

```tsx
// In parent component
const { openDeleteDialog, deletingQuizId } = useQuizDialogStore();
const deletingQuiz = deletingQuizId
  ? quizzes.find(quiz => quiz.id === deletingQuizId) || null
  : null;

// Button to trigger
<Button onClick={() => openDeleteDialog(quiz.id)}>Hapus Quiz</Button>

// Dialog component (renders based on store state)
<DeleteQuizDialog quiz={deletingQuiz} />
```

### 4. TeacherQuizManager

Komponen manajemen quiz untuk teacher dengan **Zustand integration**.

**Features:**

- **Centralized Dialog Control**: Menggunakan `useQuizDialogStore()` untuk control dialogs
- **No Embedded Dialogs**: Dialog components di-render di level component, triggered via store
- Quiz counter dan limit tracking
- Action menu untuk setiap quiz dengan store-based actions
- **Performance Improvement**: Tidak ada nested dialog components

**Updated Implementation:**

```tsx
const TeacherQuizManager: React.FC<TeacherQuizManagerProps> = ({
  chapterId,
}) => {
  const { quizzes } = useQuizBuilder(chapterId);
  const {
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
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

  return (
    <div>
      {/* Quiz list dengan buttons */}
      <Button onClick={openCreateDialog}>Buat Quiz</Button>

      {quizzes.map((quiz) => (
        <div key={quiz.id}>
          <Button onClick={() => openEditDialog(quiz.id)}>Edit</Button>
          <Button onClick={() => openDeleteDialog(quiz.id)}>Delete</Button>
        </div>
      ))}

      {/* Dialog components di level ini */}
      <CreateQuizDialog chapterId={chapterId} />
      <EditQuizDialog quiz={editingQuiz} />
      <DeleteQuizDialog quiz={deletingQuiz} />
    </div>
  );
};
```

## Technical Implementation

### Zustand Store Structure

```typescript
interface QuizDialogState {
  // Create Quiz Dialog
  isCreateOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  // Edit Quiz Dialog
  isEditOpen: boolean;
  editingQuizId: string | null;
  openEditDialog: (quizId: string) => void;
  closeEditDialog: () => void;

  // Delete Quiz Dialog
  isDeleteOpen: boolean;
  deletingQuizId: string | null;
  openDeleteDialog: (quizId: string) => void;
  closeDeleteDialog: () => void;

  // Reset all states
  resetAllDialogs: () => void;
}
```

### Form Management tetap dengan React Hook Form

**Form tetap menggunakan react-hook-form**, hanya state management dialog yang dipindah ke Zustand:

```typescript
// Di dalam dialog component
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    /* ... */
  },
});

const { isCreateOpen, closeCreateDialog } = useQuizDialogStore();

const onSubmit = async (data: FormData) => {
  // Form submission logic
  await createQuizMutation.mutateAsync(data);
  form.reset();
  closeCreateDialog(); // Close via store action
};
```

### Performance Benefits

1. **Reduced Re-renders**: Hanya components yang subscribe ke specific state yang re-render
2. **No Props Drilling**: Dialog state tidak perlu di-pass through component tree
3. **Lazy Component Loading**: Dialog components hanya render saat dibutuhkan
4. **Memory Efficient**: Shared state management reduces memory footprint

## Migration Guide

### Dari useState ke Zustand

**Before (useState):**

```tsx
// Di dalam dialog component
const [open, setOpen] = useState(false);

// Di parent component
<CreateQuizDialog trigger={<Button>Create</Button>} chapterId={chapterId} />;
```

**After (Zustand):**

```tsx
// Di parent component
const { openCreateDialog } = useQuizDialogStore();

<Button onClick={openCreateDialog}>Create</Button>
<CreateQuizDialog chapterId={chapterId} />
```

### Breaking Changes

1. **Removed Props**:

   - `trigger` prop dari semua dialog components
   - `disabled` dan `maxQuizzesReached` dari CreateQuizDialog

2. **New Store Dependency**:

   - Semua components harus wrap dalam Zustand provider context
   - Import `useQuizDialogStore` di parent components

3. **Quiz Object Handling**:
   - EditQuizDialog dan DeleteQuizDialog sekarang menerima `quiz: Quiz | null`
   - Parent component bertanggung jawab find quiz object berdasarkan ID dari store

## Testing

### QuizManagerExample Component

```tsx
import QuizManagerExample from "@/components/quiz/QuizManagerExample";

// Test all dialog functionality
<QuizManagerExample chapterId="test-chapter" />;
```

**Features:**

- Buttons untuk test semua dialog actions
- Real-time state display
- Reset functionality
- Integrated dengan actual TeacherQuizManager

## Dependencies

### Updated Package Requirements

```json
{
  "react-hook-form": "^7.54.2",
  "@hookform/resolvers": "^3.10.0",
  "zod": "^3.24.1",
  "sonner": "^1.7.2",
  "zustand": "^5.0.3" // Added for state management
}
```

## Integration

### Chapter Detail Page

```tsx
import QuizTabContent from "@/components/quiz/QuizTabContent";

// Di dalam Tabs - no changes needed
<TabsContent value="quiz">
  <QuizTabContent chapterId={chapterId} onQuizComplete={handleQuizComplete} />
</TabsContent>;
```

### Standalone Usage dengan Zustand

```tsx
// Parent component handles all dialog state
const ParentComponent = () => {
  const { openCreateDialog, openEditDialog, openDeleteDialog } =
    useQuizDialogStore();
  const { quizzes } = useQuizBuilder(chapterId);

  return (
    <div>
      {/* Trigger buttons */}
      <Button onClick={openCreateDialog}>Create Quiz</Button>

      {quizzes.map((quiz) => (
        <div key={quiz.id}>
          <Button onClick={() => openEditDialog(quiz.id)}>Edit</Button>
          <Button onClick={() => openDeleteDialog(quiz.id)}>Delete</Button>
        </div>
      ))}

      {/* Dialog components */}
      <CreateQuizDialog chapterId={chapterId} />
      <EditQuizDialog quiz={editingQuiz} />
      <DeleteQuizDialog quiz={deletingQuiz} />
    </div>
  );
};
```

## Troubleshooting

### Common Issues dengan Zustand

1. **Store Not Found Error**:

   ```typescript
   // Make sure to import the store correctly
   import { useQuizDialogStore } from "@/stores/use-store-quiz-dialog";
   ```

2. **Quiz Object Not Found**:

   ```typescript
   // Always check for null quiz objects
   const editingQuiz = editingQuizId
     ? quizzes.find((quiz) => quiz.id === editingQuizId) || null
     : null;

   // In dialog component
   if (!quiz) return null;
   ```

3. **Multiple Dialog Open Issue**:
   ```typescript
   // Use resetAllDialogs to close all dialogs
   const { resetAllDialogs } = useQuizDialogStore();
   resetAllDialogs();
   ```

### Performance Monitoring

```typescript
// Enable Zustand DevTools in development
import { devtools } from "zustand/middleware";

export const useQuizDialogStore = create<QuizDialogState>()(
  devtools((set) => ({
    /* store implementation */
  }))
);
```

## Future Enhancements

1. **Persistence**: Persist dialog state across page refreshes
2. **Multiple Instances**: Support multiple quiz managers on same page
3. **Animation**: Add transition animations untuk dialog state changes
4. **Undo/Redo**: Implement undo/redo functionality dengan Zustand
5. **Real-time Updates**: Sync dialog state dengan WebSocket updates
