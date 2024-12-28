import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const cookieStore = await cookies();
  const thumbmark = cookieStore.get('thumbmark')?.value;

  if (!thumbmark) {
    return new Response(JSON.stringify({ error: 'Thumbmark not found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        postId: postId,
        thumbmark: thumbmark,
      },
    });

    if (existingVote) {
      if (existingVote.type === 'downvote') {
        console.log('Existing downvote found, removing downvote');
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: { votes: { increment: 1 } },
        });
        return new Response(JSON.stringify({ message: 'Downvote removed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (existingVote.type === 'upvote') {
        console.log('Existing upvote found, removing upvote and adding downvote');
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.vote.create({
          data: {
            postId: postId,
            thumbmark: thumbmark,
            type: 'downvote',
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: { votes: { decrement: 2 } }, // Decrement by 2 because we're going from +1 to -1
        });
        return new Response(JSON.stringify({ message: 'Vote changed to downvote' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      await prisma.vote.create({
        data: {
          postId: postId,
          thumbmark: thumbmark,
          type: 'downvote',
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { votes: { decrement: 1 } },
      });
      return new Response(JSON.stringify({ message: 'Downvoted!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Error downvoting:', error);
    return new Response(JSON.stringify({ error: 'Failed to downvote' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}