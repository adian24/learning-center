import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { text, type, points, explanation, quizId } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const question = await db.question.create({
      data: {
        text,
        type,
        points,
        explanation,
        quizId
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('[QUESTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
