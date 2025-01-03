import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const POST_SETTING_DEFAULT_EXPIRATION_DAYS = 30;

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const { postId } = await params;
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

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + POST_SETTING_DEFAULT_EXPIRATION_DAYS);

    if (existingVote) {
      if (existingVote.type === 'upvote') {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            votes: { decrement: 1 },
            expiredAt: expirationDate,
          } as Prisma.PostUpdateInput,
        });
        return new Response(JSON.stringify({ message: 'Upvote removed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (existingVote.type === 'downvote') {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.vote.create({
          data: {
            postId: postId,
            thumbmark: thumbmark,
            type: 'upvote',
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            votes: { increment: 2 }, // Increment by 2 because we're going from -1 to +1
            expiredAt: expirationDate,
          } as Prisma.PostUpdateInput,
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
          thumbmark: thumbmark,
          type: 'upvote',
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: {
          votes: { increment: 1 },
          expiredAt: expirationDate,
        } as Prisma.PostUpdateInput,
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
