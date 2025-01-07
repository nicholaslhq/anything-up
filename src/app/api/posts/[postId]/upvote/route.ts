import { PrismaClient, VoteType } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request, context: { params: { postId: string } }) {
  const { postId } = await context.params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId not found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (existingVote) {
      if (existingVote.type === VoteType.UPVOTE) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return new Response(JSON.stringify({ message: 'Upvote removed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (existingVote.type === VoteType.DOWNVOTE) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.vote.create({
          data: {
            postId: postId,
            userId: userId,
            type: VoteType.UPVOTE,
          },
        });
        return new Response(JSON.stringify({ message: 'Vote changed to upvote' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      await prisma.vote.create({
        data: {
          postId: postId,
          userId: userId,
          type: VoteType.UPVOTE,
        },
      });
      return new Response(JSON.stringify({ message: 'Upvoted!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Error upvoting:', error);
    return new Response(JSON.stringify({ error: 'Failed to upvote' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
