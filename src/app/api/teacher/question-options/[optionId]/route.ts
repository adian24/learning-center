import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db/db';

export async function GET(
  req: Request,
  { params }: { params: { optionId: string } }
) {
  try {
    const option = await db.questionOption.findUnique({
      where: {
        id: params.optionId
      }
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error('[QUESTION_OPTION_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { optionId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { text, isCorrect } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const option = await db.questionOption.update({
      where: {
        id: params.optionId
      },
      data: {
        text,
        isCorrect
      }
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error('[QUESTION_OPTION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { optionId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const option = await db.questionOption.delete({
      where: {
        id: params.optionId
      }
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error('[QUESTION_OPTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
