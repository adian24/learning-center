import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { text, isCorrect, questionId } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const option = await db.questionOption.create({
      data: {
        text,
        isCorrect,
        questionId
      }
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error('[QUESTION_OPTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
