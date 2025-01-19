"use client";

import { useState, useEffect } from "react";
import UserIdentifier from "@/components/UserIdentifier";
import Title from "@/components/Title";
import PostComponent, { Post as PostType } from "@/components/post/Post";
import PostStatus from "@/components/post/PostStatus";
import { useParams } from "next/navigation";
import PostFooter from "@/components/post/PostFooter";
import { SETTING_POST_LOADING_TIMEOUT } from "@/lib/settings";

export interface Post {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	content: string;
	votes: number;
	status: string;
	expiredAt: Date;
	tags: string[];
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	userVote: "UPVOTE" | "DOWNVOTE" | null;
}

export default function PostDetailPage() {
	const [post, setPost] = useState<PostType | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expired, setExpired] = useState(false);
	const { postId } = useParams();

	useEffect(() => {
		const fetchPost = async () => {
			if (!postId) return;

			setLoading(true);
			setError(null);
			setExpired(false);
			const timeoutId = setTimeout(() => {
				setError("Failed to load post. Please check your connection.");
				setLoading(false);
			}, SETTING_POST_LOADING_TIMEOUT);
			try {
				const res = await fetch(`/api/posts/${postId}`);
				if (!res.ok) {
					const message = `Failed to fetch post: ${res.status} ${res.statusText}`;
					setError(message);
					if (res.status === 404) {
						setExpired(true);
					}
				} else {
					const data: PostType = await res.json();
					setPost(data);
				}
			} catch (e: unknown) {
				console.error("Failed to fetch post:", e);
				setError("Failed to load post. Please check your connection.");
			} finally {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				setLoading(false);
			}
		};

		fetchPost();
	}, [postId]);

	const handleUpvote = async (postId: string) => {
		await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
		setPost((prevPost) => {
			if (!prevPost) return prevPost;
			return {
				...prevPost,
				userVote: prevPost.userVote === "UPVOTE" ? null : "UPVOTE",
				upVotes:
					prevPost.userVote === "UPVOTE"
						? prevPost.upVotes - 1
						: prevPost.userVote === "DOWNVOTE"
						? prevPost.upVotes + 1
						: prevPost.upVotes + 1,
				downVotes:
					prevPost.userVote === "DOWNVOTE"
						? prevPost.downVotes - 1
						: prevPost.downVotes,
			};
		});
	};

	const handleDownvote = async (postId: string) => {
		await fetch(`/api/posts/${postId}/downvote`, { method: "POST" });
		setPost((prevPost) => {
			if (!prevPost) return prevPost;
			return {
				...prevPost,
				userVote: prevPost.userVote === "DOWNVOTE" ? null : "DOWNVOTE",
				downVotes:
					prevPost.userVote === "DOWNVOTE"
						? prevPost.downVotes - 1
						: prevPost.userVote === "UPVOTE"
						? prevPost.downVotes + 1
						: prevPost.downVotes + 1,
				upVotes:
					prevPost.userVote === "UPVOTE"
						? prevPost.upVotes - 1
						: prevPost.upVotes,
			};
		});
	};

	return (
		<div className="min-h-screen p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 md:gap-10 items-center">
				<UserIdentifier />
				<Title loading={loading} />
				{error || loading || expired ? (
					<PostStatus
						error={null}
						loading={loading}
						empty={false}
						expired={expired}
					/>
				) : (
					post && (
						<div key={post?.id} className="flex w-full sm:max-w-lg">
							<PostComponent
								post={post}
								handleUpvote={handleUpvote}
								handleDownvote={handleDownvote}
								onTagClick={() => {}}
								selectedTag={null}
							/>
						</div>
					)
				)}
				{post && <PostFooter />}
			</main>
		</div>
	);
}
