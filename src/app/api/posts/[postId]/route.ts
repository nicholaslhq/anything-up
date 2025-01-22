import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PostType } from "@prisma/client";

interface Params {
	params: {
		postId: string;
	};
}

export async function GET(req: Request, { params }: Params) {
	const userId = (await cookies()).get("userId")?.value;
	const { postId } = await params;

	try {
		const post = await prisma.post.findUnique({
			where: {
				id: postId,
				expiredAt: { gt: new Date() },
				type: PostType.STANDARD,
			},
			include: {
				tags: true,
				votes: {
					where: {
						userId: userId,
					},
				},
			},
		});

		if (!post) {
			return new NextResponse("Post not found or expired", { status: 404 });
		}

		const userVote = post.votes.length > 0 ? post.votes[0].type : null;

		const postWithDetails = {
			...post,
			tags: post.tags.map((tag) => tag.name),
			upVotes: await prisma.vote.count({
				where: {
					postId: post.id,
					type: "UPVOTE",
				},
			}),
			downVotes: await prisma.vote.count({
				where: {
					postId: post.id,
					type: "DOWNVOTE",
				},
			}),
			expiresInDays: Math.ceil(
				(post.expiredAt!.getTime() - new Date().getTime()) /
					(1000 * 60 * 60 * 24)
			),
			userVote: userVote,
		};

		return NextResponse.json(postWithDetails);
	} catch (error) {
		console.error("Error fetching post:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
