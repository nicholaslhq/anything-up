import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PostType, Prisma, VoteType } from "@prisma/client";
import { cookies } from "next/headers";
import {
	SETTING_POST_DEFAULT_EXPIRATION_DAYS,
	SETTING_POST_HOT_SORT_RETROSPECTIVE_DAYS,
	SETTING_POST_MAX_POSTS_PER_HOUR,
} from "@/lib/settings";

export async function POST(request: Request) {
	const cookieStore = await cookies();
	const userId = cookieStore.get("userId")?.value;

	if (!userId) {
		return NextResponse.json(
			{ error: "userId not found" },
			{ status: 400 }
		);
	}

	try {
		const existingPostsCount = await prisma.post.count({
			where: {
				createdAt: {
					gte: new Date(Date.now() - 60 * 60 * 1000),
				},
				userId: userId,
			},
		});

		if (existingPostsCount >= SETTING_POST_MAX_POSTS_PER_HOUR) {
			return NextResponse.json(
				{ error: "RATE_LIMIT_EXCEEDED" },
				{ status: 429 }
			);
		}

		const json = await request.json();

		if (!json || typeof json !== "object") {
			return NextResponse.json(
				{ error: "Invalid or empty JSON body" },
				{ status: 400 }
			);
		}

		const { content, tags, expirationDays } = json;
		const filteredTags = tags.filter((tag: string) => tag.trim() !== "");

		const finalExpirationDays =
			expirationDays !== undefined
				? parseInt(expirationDays, 30)
				: SETTING_POST_DEFAULT_EXPIRATION_DAYS;

		// Create the post in the database
		const now = new Date();
		const expiredAt = new Date();
		expiredAt.setDate(now.getDate() + finalExpirationDays);
		const post = await prisma.post.create({
			data: {
				content,
				userId: userId,
				tags: {
					connectOrCreate: filteredTags.map((tag: string) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
				createdAt: now,
				updatedAt: now,
				expiredAt,
			} as Prisma.PostCreateInput,
		});

		// Fetch initial vote counts for the new post
		const voteCounts = await prisma.vote.groupBy({
			by: ["type"],
			where: {
				postId: post.id,
			},
			_count: {
				_all: true,
			},
		});

		const upVotes =
			voteCounts.find((vote) => vote.type === VoteType.UPVOTE)?._count._all || 0;
		const downVotes =
			voteCounts.find((vote) => vote.type === VoteType.DOWNVOTE)?._count._all ||
			0;

		const postWithVotes = {
			...post,
			upVotes: upVotes,
			downVotes: downVotes,
			expiresInDays: Math.ceil(
				(post.expiredAt.getTime() - new Date().getTime()) /
					(1000 * 60 * 60 * 24)
			),
			userVote: null, // Newly created posts have no user vote
		};

		return NextResponse.json(postWithVotes, { status: 201 });
	} catch (error) {
		console.error("Error creating post:", String(error));
		return NextResponse.json(
			{ error: "Failed to create post" },
			{ status: 500 }
		);
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const sortBy = searchParams.get("sortBy");
	const timePeriod = searchParams.get("timePeriod");
	const userId = (await cookies()).get("userId")?.value;

	try {
		let orderBy: Prisma.PostOrderByWithRelationInput = {};
		let where: Prisma.PostWhereInput = {
			expiredAt: { gt: new Date() },
			type: PostType.STANDARD,
		};

		if (sortBy === "new") {
			orderBy = { createdAt: "desc" };
		} else if (sortBy === "top") {
			orderBy = {
				votes: {
					_count: "desc",
				},
			};
			if (timePeriod === "day") {
				const oneDayAgo = new Date();
				oneDayAgo.setDate(oneDayAgo.getDate() - 1);
				where = {
					...where,
					createdAt: { gte: oneDayAgo },
				};
			} else if (timePeriod === "week") {
				const oneWeekAgo = new Date();
				oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
				where = {
					...where,
					createdAt: { gte: oneWeekAgo },
				};
			} else if (timePeriod === "month") {
				const oneMonthAgo = new Date();
				oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
				where = {
					...where,
					createdAt: { gte: oneMonthAgo },
				};
			}
		} else if (sortBy === "hot") {
			orderBy = {
				votes: {
					_count: "desc",
				},
			};
			// Define a retrospective period to consider for hot posts
			const retrospective = new Date();
			retrospective.setDate(
				retrospective.getDate() -
					SETTING_POST_HOT_SORT_RETROSPECTIVE_DAYS
			);
			where = {
				...where,
				// Consider posts created within the retrospective period
				createdAt: { gte: retrospective },
				// Consider posts that have received votes in the last 24 hours
				votes: {
					some: {
						createdAt: {
							gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
						},
					},
				},
			};
		}

		const posts = await prisma.post.findMany({
			orderBy,
			where,
			include: {
				tags: true,
				votes: {
					where: {
						userId: userId,
					},
				},
			},
		});

		const pinnedPosts = await prisma.post.findMany({
			where: {
				expiredAt: { gt: new Date() },
				type: PostType.PINNED,
			},
			include: {
				tags: true,
				votes: {
					where: {
						userId: userId,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const allPosts = [...pinnedPosts, ...posts];

		// Fetch vote counts for all posts in one query
		const voteCounts = await prisma.vote.groupBy({
			by: ["postId", "type"],
			where: {
				postId: {
					in: allPosts.map((post) => post.id),
				},
			},
			_count: {
				_all: true,
			},
		});

		const postsWithDetails = allPosts.map((post) => {
			const userVote = post.votes.length > 0 ? post.votes[0].type : null;
			const upVotes =
				voteCounts.find(
					(vote) => vote.postId === post.id && vote.type === VoteType.UPVOTE
				)?._count._all || 0;
			const downVotes =
				voteCounts.find(
					(vote) =>
						vote.postId === post.id && vote.type === VoteType.DOWNVOTE
				)?._count._all || 0;

			return {
				...post,
				tags: post.tags.map((tag) => tag.name),
				upVotes: upVotes,
				downVotes: downVotes,
				expiresInDays: Math.ceil(
					(post.expiredAt!.getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24)
				),
				userVote: userVote,
			};
		});

		return NextResponse.json(postsWithDetails);
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts" },
			{ status: 500 }
		);
	}
}
