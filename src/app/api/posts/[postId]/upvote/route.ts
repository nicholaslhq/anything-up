import { PrismaClient, VoteType, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	SETTING_POST_DEFAULT_EXPIRATION_DAYS,
	SETTING_POST_MAX_VOTES_PER_HOUR,
} from "@/lib/settings";

const prisma = new PrismaClient();

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> }
) {
	const { postId } = await params;
	const cookieStore = await cookies();
	const userId = cookieStore.get("userId")?.value;

	if (!userId) {
		return new Response(JSON.stringify({ error: "userId not found" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
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

	if (votesInLastHour >= SETTING_POST_MAX_VOTES_PER_HOUR) {
		return NextResponse.json(
			{ error: "RATE_LIMIT_EXCEEDED" },
			{ status: 429 }
		);
	}

	try {
		// Use a transaction to ensure atomicity
		const result = await prisma.$transaction(async (tx) => {
			const existingVote = await tx.vote.findFirst({
				where: {
					postId: postId,
					userId: userId,
				},
			});

			const expirationDate = new Date();
			expirationDate.setDate(
				expirationDate.getDate() + SETTING_POST_DEFAULT_EXPIRATION_DAYS
			);

			if (existingVote) {
				if (existingVote.type === VoteType.UPVOTE) {
					// --- Cancel existing upvote ---
					await tx.vote.update({
						where: {
							id: existingVote.id,
						},
						data: {
							type: VoteType.CANCELLED,
						},
					});
					// Decrement post's upvote count
					await tx.post.update({
						where: { id: postId },
						data: { upVotes: { decrement: 1 } },
					});
					return { message: "Upvote cancelled", status: 200 };
				} else {
					// --- Change existing vote (DOWNVOTE or CANCELLED) to UPVOTE ---
					const previousVoteType = existingVote.type;
					await tx.vote.update({
						where: { id: existingVote.id },
						data: { type: VoteType.UPVOTE },
					});
					// Prepare post update data
					const postUpdateData: Prisma.PostUpdateInput = {
						upVotes: { increment: 1 },
					};
					// If changing from DOWNVOTE, also decrement downvotes
					if (previousVoteType === VoteType.DOWNVOTE) {
						postUpdateData.downVotes = { decrement: 1 };
					}
					// Update post counts
					await tx.post.update({
						where: { id: postId },
						data: postUpdateData,
					});
					return { message: "Vote changed to upvote", status: 200 };
				}
			} else {
				// --- Create new upvote ---
				await tx.vote.create({
					data: {
						postId: postId,
						userId: userId,
						type: VoteType.UPVOTE,
					},
				});
				// Increment post's upvote count and update expiration
				await tx.post.update({
					where: { id: postId },
					data: {
						upVotes: { increment: 1 },
						expiredAt: expirationDate,
					},
				});
				return { message: "Upvoted successfully", status: 201 }; // Use 201 for creation
			}
		});

		// Return the response based on the transaction result
		return NextResponse.json(
			{ message: result.message },
			{ status: result.status }
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(
			JSON.stringify({ error: "An unknown error occurred" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
