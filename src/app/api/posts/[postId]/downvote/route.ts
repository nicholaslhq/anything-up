import { PrismaClient, Prisma, VoteType } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const POST_SETTING_DEFAULT_EXPIRATION_DAYS = 30;
const POST_SETTING_MAX_VOTES_PER_HOUR = 60;

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

  const votesInLastHour = await prisma.vote.count({
    where: {
      userId: userId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  if (votesInLastHour >= POST_SETTING_MAX_VOTES_PER_HOUR) {
    return NextResponse.json(
      { error: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 }
    );
  }

  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + POST_SETTING_DEFAULT_EXPIRATION_DAYS);

    if (existingVote) {
      if (existingVote.type === VoteType.DOWNVOTE) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            expiredAt: expirationDate,
          } as Prisma.PostUpdateInput,
        });
        return new Response(JSON.stringify({ message: 'Downvote removed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (existingVote.type === VoteType.UPVOTE) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await prisma.vote.create({
          data: {
            postId: postId,
            userId: userId,
            type: VoteType.DOWNVOTE,
          },
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            expiredAt: expirationDate,
          } as Prisma.PostUpdateInput,
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
          userId: userId,
          type: VoteType.DOWNVOTE,
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: {
          expiredAt: expirationDate,
        } as Prisma.PostUpdateInput,
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
