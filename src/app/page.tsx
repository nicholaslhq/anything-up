"use client";

import { useState, useEffect } from "react";
import PostForm from "@/components/post/PostForm";
import UserIdentifier from "@/components/UserIdentifier";
import NavigationBar from "@/components/NavigationBar";
import PostComponent, { Post as PostType } from "@/components/post/Post";
import PostStatus from "@/components/post/PostStatus";
import PostFooter from "@/components/post/PostFooter";
import { useToast } from "@/hooks/use-toast";

const POST_SETTING_LOADING_TIMEOUT = 5000;

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

export default function Home() {
	const [posts, setPosts] = useState<PostType[]>([]);
	const [loading, setLoading] = useState(false);
	const [empty, setEmpty] = useState(false);
	const [content, setContent] = useState("");
	const [sortBy, setSortBy] = useState("hot"); // Default sort
	const [refreshPosts, setRefreshPosts] = useState(false);
	const [timePeriod, setTimePeriod] = useState("day");
	const [error, setError] = useState<string | null>(null);
	const [isUserIdAvailable, setIsUserIdAvailable] = useState(false);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		setIsUserIdAvailable(true);
	}, []);

	useEffect(() => {
		if (!isUserIdAvailable) {
			return;
		}

		const fetchPosts = async () => {
			setLoading(true);
			setError(null);
			const timeoutId = setTimeout(() => {
				setError("Failed to load posts. Please check your connection.");
				setLoading(false);
			}, POST_SETTING_LOADING_TIMEOUT);
			try {
				const res = await fetch(
					`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
				);
				if (!res.ok) {
					const message = `Failed to fetch posts: ${res.status} ${res.statusText}`;
					setError(message);
				} else {
					const data: PostType[] = await res.json();
					setPosts(data);
					setEmpty(data.length === 0);
				}
			} catch (e: unknown) {
				console.error("Failed to fetch posts:", e);
				setError("Failed to load posts. Please check your connection.");
			} finally {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				setLoading(false);
			}
		};

		fetchPosts();
	}, [sortBy, timePeriod, isUserIdAvailable, refreshPosts]);

	const handleUpvote = async (postId: string) => {
		await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
		setPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					return {
						...post,
						userVote: post.userVote === "UPVOTE" ? null : "UPVOTE",
						upVotes:
							post.userVote === "UPVOTE"
								? post.upVotes - 1
								: post.userVote === "DOWNVOTE"
								? post.upVotes + 1
								: post.upVotes + 1,
						downVotes:
							post.userVote === "DOWNVOTE"
								? post.downVotes - 1
								: post.downVotes,
					};
				}
				return post;
			})
		);
	};

	const handleDownvote = async (postId: string) => {
		await fetch(`/api/posts/${postId}/downvote`, { method: "POST" });
		setPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					return {
						...post,
						userVote:
							post.userVote === "DOWNVOTE" ? null : "DOWNVOTE",
						downVotes:
							post.userVote === "DOWNVOTE"
								? post.downVotes - 1
								: post.userVote === "UPVOTE"
								? post.downVotes + 1
								: post.downVotes + 1,
						upVotes:
							post.userVote === "UPVOTE"
								? post.upVotes - 1
								: post.upVotes,
					};
				}
				return post;
			})
		);
	};

	const handleSubmit = async (event: React.FormEvent, tags: string[]) => {
		event.preventDefault();
		await fetch("/api/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content,
				tags,
			}),
		});

		toast({
			title: "It’s Up!",
			description: "Your world is up for everyone to see",
		});

		const res = await fetch(
			`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
		);
		const data: PostType[] = await res.json();
		setPosts(data);
		setEmpty(data.length === 0);
		setContent("");
	};

	const handleTagClick = (tag: string) => {
		setSelectedTag((prevSelectedTag) =>
			prevSelectedTag === tag ? null : tag
		);
	};

	const filteredPosts = selectedTag
		? posts.filter((post) =>
				post.tags?.some(
					(tag) => tag.toLowerCase() === selectedTag.toLowerCase()
				)
		  )
		: posts;

	return (
		<div className="min-h-screen p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 md:gap-10 items-center">
				<UserIdentifier />
				<h1 className="text-2xl font-bold text-text">AnythingUp</h1>
				<NavigationBar
					sortBy={sortBy}
					setSortBy={setSortBy}
					timePeriod={timePeriod}
					setTimePeriod={setTimePeriod}
					refreshPosts={refreshPosts}
					setRefreshPosts={setRefreshPosts}
				/>
				<PostForm
					handleSubmit={handleSubmit}
					content={content}
					setContent={setContent}
				/>
				{error || loading || empty ? (
					<PostStatus error={error} loading={loading} empty={empty} />
				) : (
					filteredPosts.map((post) => (
						<div key={post.id} className="flex w-full sm:max-w-lg">
							<PostComponent
								post={post}
								handleUpvote={handleUpvote}
								handleDownvote={handleDownvote}
								onTagClick={handleTagClick}
								selectedTag={selectedTag}
							/>
						</div>
					))
				)}
				{filteredPosts.length > 0 && <PostFooter />}
			</main>
		</div>
	);
}
