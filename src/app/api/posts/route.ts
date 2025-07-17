import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Post, Tag, Vote, PostType, Prisma, VoteType } from "@prisma/client";
import { cookies } from "next/headers";
import {
	SETTING_POST_DEFAULT_EXPIRATION_DAYS,
	SETTING_POST_HOT_SORT_RETROSPECTIVE_DAYS,
	SETTING_POST_MAX_POSTS_PER_HOUR,
} from "@/lib/settings";

// --- Type Definitions ---

// Type for the post structure including relations expected from findMany
type PostWithRelations = Post & {
	tags: Tag[];
	votes: Vote[];
	upVotes: number;
	downVotes: number;
};

// Define the expected structure for the API response explicitly
type ProcessedPost = {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	type: PostType;
	upVotes: number;
	downVotes: number;
	tags: string[];
	expiresInDays: number;
	userVote: VoteType | null;
};

// --- POST Handler (Unchanged) ---
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

		// Check for duplicate active posts by the same user with the same content
		const json = await request.json(); // Need to parse json first to get content

		if (!json || typeof json !== "object") {
			return NextResponse.json(
				{ error: "Invalid or empty JSON body" },
				{ status: 400 }
			);
		}

		const { content, tags, expirationDays } = json as {
			// Extract all necessary fields
			content: string;
			tags: string[];
			expirationDays?: number;
		};

		// Check for duplicate active posts by the same user with the same content
		const duplicatePostCount = await prisma.post.count({
			where: {
				userId: userId,
				content: content,
				expiredAt: {
					gt: new Date(), // Check if the post is not expired
				},
			},
		});

		if (duplicatePostCount > 0) {
			return NextResponse.json(
				{ error: "DUPLICATE_POST" },
				{ status: 409 } // Conflict status code
			);
		}

		// Continue with post creation if no duplicate is found

		const filteredTags = tags.filter((tag: string) => tag.trim() !== "");

		const finalExpirationDays =
			expirationDays !== undefined && !isNaN(expirationDays)
				? expirationDays // Use provided days if valid
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
				// Ensure type is set if needed, default is STANDARD
				type: PostType.STANDARD,
			},
			include: { tags: true }, // Include tags to return them immediately
		});

		// Since we included tags, we can map them directly
		const postWithMappedTags = {
			...post,
			tags: post.tags.map((tag) => tag.name),
		};

		// Add initial vote counts (0) and userVote (null) for the new post response
		const responsePost: ProcessedPost = {
			...postWithMappedTags,
			upVotes: 0,
			downVotes: 0,
			expiresInDays: finalExpirationDays,
			userVote: null,
		};

		return NextResponse.json(responsePost, { status: 201 });
	} catch (error) {
		console.error("Error creating post:", String(error));
		// Check for specific Prisma errors if needed
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			// Handle specific errors like unique constraint violations, etc.
			return NextResponse.json(
				{ error: `Database error: ${error.code}` },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: "Failed to create post" },
			{ status: 500 }
		);
	}
}

// --- GET Handler (Rewritten with Pagination) ---
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const sortBy = searchParams.get("sortBy") ?? "hot"; // Default sort
	const timePeriod = searchParams.get("timePeriod") ?? "day"; // Default time period
	const tag = searchParams.get("tag");
	const pageParam = searchParams.get("page");
	const limitParam = searchParams.get("limit");
	const userId = (await cookies()).get("userId")?.value;

	// --- Pagination Logic ---
	let page = 1;
	let limit = 20; // Default limit

	if (pageParam) {
		const parsedPage = parseInt(pageParam, 10);
		if (!isNaN(parsedPage) && parsedPage > 0) {
			page = parsedPage;
		}
	}
	if (limitParam) {
		const parsedLimit = parseInt(limitParam, 10);
		// Add a reasonable max limit to prevent abuse
		if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
			limit = parsedLimit;
		}
	}

	const skip = (page - 1) * limit;
	const take = limit;
	// --- End Pagination Logic ---

	try {
		let orderBy: Prisma.PostOrderByWithRelationInput[] = [];
		let where: Prisma.PostWhereInput = {
			expiredAt: { gt: new Date() },
			type: PostType.STANDARD, // Only fetch standard posts for pagination
		};

		if (tag) {
			where = {
				...where,
				tags: {
					some: {
						name: tag,
					},
				},
			};
		}

		// --- Sorting and Filtering Logic ---
		if (sortBy === "new") {
			orderBy = [{ createdAt: "desc" }];
		} else if (sortBy === "top") {
			orderBy = [{ upVotes: "desc" }, { downVotes: "asc" }];
			// Apply time period filter for 'top' sort
			let dateFilter: Date | undefined;
			if (timePeriod === "day") {
				dateFilter = new Date();
				dateFilter.setDate(dateFilter.getDate() - 1);
			} else if (timePeriod === "week") {
				dateFilter = new Date();
				dateFilter.setDate(dateFilter.getDate() - 7);
			} else if (timePeriod === "month") {
				dateFilter = new Date();
				dateFilter.setMonth(dateFilter.getMonth() - 1);
			}
			// Add 'all' timePeriod if needed, otherwise no date filter for 'top all'
			if (dateFilter) {
				where = { ...where, createdAt: { gte: dateFilter } };
			}
		} else if (sortBy === "hot") {
			// Hot sort: combination of recent activity and votes
			// Simple approach: Order by vote count within a recent timeframe
			orderBy = [{ upVotes: "desc" }, { downVotes: "asc" }];
			const retrospective = new Date();
			retrospective.setDate(
				retrospective.getDate() -
					SETTING_POST_HOT_SORT_RETROSPECTIVE_DAYS
			);
			where = {
				...where,
				createdAt: { gte: retrospective }, // Consider recently created posts
				// Optionally add filter for recent votes if needed for stricter 'hot' definition
				// votes: { some: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }
			};
		}
		// --- End Sorting and Filtering Logic ---

		// --- Database Queries ---

		// 1. Fetch Standard Posts (Paginated)
		// Use include to get base Post fields + relations
		const standardPosts = (await prisma.post.findMany({
			skip,
			take,
			orderBy,
			where,
			include: {
				tags: { select: { name: true } },
				votes: {
					where: { userId: userId },
					take: 1,
				},
			},
		})) as PostWithRelations[];

		// 2. Fetch Pinned Posts (Only for the first page)
		let pinnedPosts: PostWithRelations[] = [];
		if (page === 1) {
			// Use include and assert type
			pinnedPosts = (await prisma.post.findMany({
				where: {
					expiredAt: { gt: new Date() },
					type: PostType.PINNED,
				},
				include: {
					tags: { select: { name: true } },
					votes: {
						where: { userId: userId },
						take: 1,
					},
				},
				orderBy: {
					createdAt: "desc", // Or desired order for pinned posts
				},
				// Pinned posts are usually few, so pagination might not be needed,
				// but add take limit if necessary: take: 10
			})) as PostWithRelations[];
		}

		// 3. Combine Posts
		const combinedPosts: PostWithRelations[] = [
			...pinnedPosts,
			...standardPosts,
		];

		// If no posts found for this page, return empty array
		if (combinedPosts.length === 0) {
			return NextResponse.json([]);
		}

		// --- End Database Queries ---

		// --- Process Posts for Response ---
		const postsWithDetails: ProcessedPost[] = combinedPosts.map(
			(post: PostWithRelations) => {
				// User's vote is directly available from the included relation
				const userVote =
					post.votes.length > 0 ? post.votes[0].type : null;

				// Use pre-calculated vote counts directly from the post object

				// Calculate expiresInDays
				const expiresInDays = post.expiredAt
					? Math.ceil(
							(post.expiredAt.getTime() - new Date().getTime()) /
								(1000 * 60 * 60 * 24)
					  )
					: 0; // Handle potentially null expiredAt if schema allows

				// Construct the final post object matching ProcessedPost type
				const processedPost: ProcessedPost = {
					id: post.id,
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
					content: post.content,
					type: post.type,
					tags: post.tags.map((tag: Tag) => tag.name),
					upVotes: post.upVotes,
					downVotes: post.downVotes,
					expiresInDays: expiresInDays > 0 ? expiresInDays : 0, // Ensure non-negative
					userVote: userVote,
				};
				return processedPost;
			}
		);
		// --- End Processing Posts ---

		return NextResponse.json(postsWithDetails);
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts" },
			{ status: 500 }
		);
	}
}
