import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

const POST_SETTING_DEFAULT_EXPIRATION_DAYS = 30;

export async function POST(request: Request) {
  try {
    const json = await request.json();

    if (!json || typeof json !== 'object') {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    const { content, tags, expirationDays } = json;
    const filteredTags = tags.filter((tag: string) => tag.trim() !== '');

    const finalExpirationDays = expirationDays !== undefined ? parseInt(expirationDays, 10) : POST_SETTING_DEFAULT_EXPIRATION_DAYS;

    // Create the post in the database
    const now = new Date();
    const expiredAt = new Date();
    expiredAt.setDate(now.getDate() + finalExpirationDays);
    const post = await prisma.post.create({
      data: {
        content,
        tags: {
          connectOrCreate: filteredTags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        createdAt: now,
        updatedAt: now,
        expiredAt,
      } as Prisma.PostCreateInput,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", String(error));
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy');
  const timePeriod = searchParams.get('timePeriod');

  try {
    let orderBy: Prisma.PostOrderByWithRelationInput = {};
    let where: Prisma.PostWhereInput = {};

    if (sortBy === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'top') {
      orderBy = {
        votes: {
          _count: 'desc',
        },
      };
      if (timePeriod === 'day') {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        where = { createdAt: { gte: oneDayAgo } };
      } else if (timePeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        where = { createdAt: { gte: oneWeekAgo } };
      } else if (timePeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        where = { createdAt: { gte: oneMonthAgo } };
      }
    } else if (sortBy === 'hot') {
      orderBy = {
        votes: {
          _count: 'desc',
        },
      };
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      where = { createdAt: { gte: oneDayAgo } }; // Filter by recent posts (last day)
    }

    const posts = await prisma.post.findMany({
      orderBy,
      where,
      include: {
        tags: true,
      },
    });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        tags: post.tags.map(tag => tag.name),
        upVotes: await prisma.vote.count({
          where: {
            postId: post.id,
            type: 'UPVOTE',
          },
        }),
        downVotes: await prisma.vote.count({
          where: {
            postId: post.id,
            type: 'DOWNVOTE',
          },
        }),
        expiresInDays: Math.ceil(
          (post.expiredAt!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
    );

    return NextResponse.json(postsWithDetails);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
