import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');
    const quizId = searchParams.get('quizId');

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Build the where clause based on provided parameters
    let whereClause: any;
    
    if (quizId) {
      // If quizId is provided, filter by specific quiz
      whereClause = { quizId };
    } else if (chapterId) {
      // If chapterId is provided, filter by chapter
      whereClause = {
        quiz: {
          chapterId: chapterId
        }
      };
    } else {
      return new NextResponse('Either Chapter ID or Quiz ID is required', { status: 400 });
    }

    const questions = await db.question.findMany({
      where: whereClause,
      include: {
        options: true,
        quiz: {
          select: {
            id: true,
            title: true,
            chapterId: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('[QUESTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

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
