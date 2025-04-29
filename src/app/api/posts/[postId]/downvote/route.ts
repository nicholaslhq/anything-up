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
				where: { postId: postId, userId: userId },
			});

			const expirationDate = new Date();
			expirationDate.setDate(
				expirationDate.getDate() + SETTING_POST_DEFAULT_EXPIRATION_DAYS
			);

			if (existingVote) {
				if (existingVote.type === VoteType.DOWNVOTE) {
					// --- Cancel existing downvote ---
					await tx.vote.update({
						where: {
							id: existingVote.id,
						},
						data: {
							type: VoteType.CANCELLED,
						},
					});
					// Decrement post's downvote count
					await tx.post.update({
						where: { id: postId },
						data: { downVotes: { decrement: 1 } },
					});
					return { message: "Downvote cancelled", status: 200 };
				} else {
					// --- Change existing vote (UPVOTE or CANCELLED) to DOWNVOTE ---
					const previousVoteType = existingVote.type;
					await tx.vote.update({
						where: { id: existingVote.id },
						data: { type: VoteType.DOWNVOTE },
					});
					// Prepare post update data
					const postUpdateData: Prisma.PostUpdateInput = {
						downVotes: { increment: 1 },
					};
					// If changing from UPVOTE, also decrement upvotes
					if (previousVoteType === VoteType.UPVOTE) {
						postUpdateData.upVotes = { decrement: 1 };
					}
					// Update post counts
					await tx.post.update({
						where: { id: postId },
						data: postUpdateData,
					});
					return { message: "Vote changed to downvote", status: 200 };
				}
			} else {
				// --- Create new downvote ---
				await tx.vote.create({
					data: {
						postId: postId,
						userId: userId,
						type: VoteType.DOWNVOTE,
					},
				});
				// Increment post's downvote count and update expiration
				await tx.post.update({
					where: { id: postId },
					data: {
						downVotes: { increment: 1 },
						expiredAt: expirationDate, // Extend expiration only on new vote
					},
				});
				return { message: "Downvoted successfully", status: 201 }; // Use 201 for creation
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
