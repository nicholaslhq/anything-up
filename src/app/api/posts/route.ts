import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log("Parsed JSON:", json);

    if (!json || typeof json !== 'object') {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    const { content, tags } = json;
    const filteredTags = tags.filter((tag: string) => tag.trim() !== '');

    // Create the post in the database
    const post = await prisma.post.create({
      data: {
        content,
        tags: filteredTags,
      },
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
    const now = new Date();

    if (sortBy === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'top') {
      orderBy = { votes: 'desc' };
      if (timePeriod === 'day') {
        where = { createdAt: { gte: new Date(now.setDate(now.getDate() - 1)) } };
      } else if (timePeriod === 'week') {
        where = { createdAt: { gte: new Date(now.setDate(now.getDate() - 7)) } };
      } else if (timePeriod === 'month') {
        where = { createdAt: { gte: new Date(now.setMonth(now.getMonth() - 1)) } };
      }
    } else if (sortBy === 'trending') {
      orderBy = { votes: 'desc' }; // Sort by votes
      where = { createdAt: { gte: new Date(now.setDate(now.getDate() - 1)) } }; // Filter by recent posts (last day)
    }

    const posts = await prisma.post.findMany({
      orderBy,
      where,
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}