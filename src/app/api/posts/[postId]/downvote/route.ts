import { PrismaClient, VoteType } from "@prisma/client";
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
		const existingVote = await prisma.vote.findFirst({
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
			if (existingVote.type === VoteType.DOWNVOTE) {
				await prisma.vote.update({
					where: {
						id: existingVote.id,
					},
					data: {
						type: VoteType.CANCELLED,
					},
				});
				return new Response(
					JSON.stringify({ message: "Downvote cancelled" }),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					}
				);
			} else {
				await prisma.vote.update({
					where: {
						id: existingVote.id,
					},
					data: {
						type: VoteType.DOWNVOTE,
					},
				});
				return new Response(
					JSON.stringify({ message: "Vote changed to downvote" }),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					}
				);
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
				},
			});
			return new Response(JSON.stringify({ message: "Downvoted" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}
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
