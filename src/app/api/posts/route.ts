import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { Post as PrismaPost, Prisma } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';

const getConfig = async () => {
  const configPath = path.join(process.cwd(), 'config', 'post.config.json');
  const configFile = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configFile);
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log("Parsed JSON:", json);

    if (!json || typeof json !== 'object') {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    const { content, tags, expirationDays } = json;
    const filteredTags = tags.filter((tag: string) => tag.trim() !== '');

    // Read the configuration
    const config = await getConfig();
    const defaultExpirationDays = config.defaultExpirationDays || 30;
    const finalExpirationDays = expirationDays !== undefined ? parseInt(expirationDays, 10) : defaultExpirationDays;

    // Create the post in the database
    const now = new Date();
    const expiredAt = new Date();
    expiredAt.setDate(now.getDate() + finalExpirationDays);
    const post = await prisma.post.create({
      data: {
        content,
        tags: filteredTags,
        createdAt: now,
        updatedAt: now,
        expiredAt,
        status: 'active',
        votes: 0,
      } as Prisma.PostCreateInput, // Use Prisma.PostCreateInput
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
    let orderBy = {};
    let where = {};

    if (sortBy === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'top') {
      orderBy = { votes: 'desc' };
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
      orderBy = { votes: 'desc' }; // Sort by votes
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      where = { createdAt: { gte: oneDayAgo } }; // Filter by recent posts (last day)
    }

    const posts = await prisma.post.findMany({
      orderBy,
      where,
    });
    return NextResponse.json<PrismaPost[]>(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}