# Learning Center Agent Instructions

## Build/Lint/Test Commands

- Development: `npm run dev` (Next.js with Turbopack)
- Build: `npm run build`
- Lint: `npm run lint`
- Database: `npm run db:generate`, `npm run db:push`, `npm run db:studio`
- **No test framework configured** - add tests using standard Next.js testing patterns if needed

## Architecture & Structure

- **Framework**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM (schema at `src/lib/db/schema.prisma`)
- **Auth**: NextAuth.js v5 with Prisma adapter
- **State**: Zustand for client state management
- **UI**: Radix UI components with custom shadcn/ui components in `src/components/ui/`
- **Payment**: Midtrans integration
- **File uploads**: AWS S3 integration

## API Routes (`src/app/api/`)

### **Auth**:

- `auth/[...nextauth]`
- `auth/check-provider`

### **Courses**:

- `courses/`
- `courses/[courseId]`
- `courses/similar`
- `courses/enrolled`
- `courses/[courseId]/chapters`
- `courses/[courseId]/reviews`
- `courses/[courseId]/learning-objectives`

### **Teacher**:

- `teacher/`
- `teacher/courses`
- `teacher/students`
- `teacher/resources`
- `teacher/questions`
- `teacher/quizzes`
- `teacher/dashboard/stats`

### **Student**:

- `student/stats`
- `student/quiz-attempts`
- `student/resources`
- `student/dashboard/*`
- `student/chapter-progress`
- `student/quizzes`

### **Payment**:

- `payment/snap`
- `payment/bank-transfer`
- `payment/ewallet`
- `payment/credit-card`
- `payment/webhook`
- `check-payment-status`
- `payment-details`

### **Upload**:

- `upload/video`
- `upload/thumbnail`
- `secure/video`
- `secure/image`

### **General**:

- `me/`
- `categories/`
- `enrollments/`
- `progress/`

## Code Style & Conventions

- Use `@/` import alias for `src/` directory
- React functional components with TypeScript interfaces
- ESLint rules are relaxed - most TypeScript strict rules disabled
- UI components follow shadcn/ui patterns with Radix primitives
- Database operations use Prisma client with generated types
- Server actions in `src/actions/` for data mutations
- Custom hooks in `src/hooks/` for reusable logic
- Store logic in `src/store/` using Zustand

## Features

- Teacher/Mentor Profile
- Student/Participant Profile
- Online Course
- Each Course has Chapters
- Each Chapter has Quiz & Resources
- Each Quiz has Question and Answer Options
- Student/Participant Progress
- Complettion Certificate
