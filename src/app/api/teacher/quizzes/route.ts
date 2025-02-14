import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { title, description, timeLimit, passingScore, chapterId } =
      await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        passingScore,
        chapterId
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[QUIZZES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');

    const quizzes = await db.quiz.findMany({
      where: {
        chapterId: chapterId || undefined
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('[QUIZZES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
