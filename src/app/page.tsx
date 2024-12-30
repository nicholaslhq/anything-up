"use client";

import { useState, useEffect } from "react";
import postConfig from "../../config/post.config.json";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "../components/ui/card";
import { ArrowBigUp, ArrowBigDown, Ellipsis } from "lucide-react";
import UserIdentifier from "../components/UserIdentifier";
import ThemeSwitcher from "../components/ThemeSwitcher";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "../components/ui/menubar";

interface Post {
	id: string;
	content: string;
	votes: number;
	tags?: string[];
}
export default function Home() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [content, setContent] = useState("");
	const [tags, setTags] = useState("");
	const [showAllTags, setShowAllTags] = useState(false);
	const [votedPosts, setVotedPosts] = useState<{
		[postId: string]: "up" | "down" | null;
	}>({});
	const [sortBy, setSortBy] = useState("hot"); // Default sort
	const [timePeriod, setTimePeriod] = useState("day");

	useEffect(() => {
		const fetchPosts = async () => {
			const res = await fetch(
				`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
			);
			const data: Post[] = await res.json();
			setPosts(data);
		};

		fetchPosts();
	}, [sortBy, timePeriod]);

	const handleUpvote = async (postId: string) => {
		const currentVote = votedPosts[postId];
		await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
		// Refresh the posts after the upvote action
		const res = await fetch(
			`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
		);
		const data: Post[] = await res.json();
		setPosts(data);
		setVotedPosts((prev) => ({
			...prev,
			[postId]: currentVote === "up" ? null : "up",
		}));
	};

	const handleDownvote = async (postId: string) => {
		const currentVote = votedPosts[postId];
		await fetch(`/api/posts/${postId}/downvote`, { method: "POST" });
		// Refresh the posts after the downvote action
		const res = await fetch(
			`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
		);
		const data: Post[] = await res.json();
		setPosts(data);
		setVotedPosts((prev) => ({
			...prev,
			[postId]: currentVote === "down" ? null : "down",
		}));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!content.trim()) {
			alert("Please enter some content for your post.");
			return;
		}
		await fetch("/api/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content,
				tags: tags.split(",").map((tag) => tag.trim()),
			}),
		});

		// After submitting, refresh the posts
		const res = await fetch(
			`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
		);
		const data: Post[] = await res.json();
		setPosts(data);
		setContent("");
		setTags("");
	};

	return (
		<div className="min-h-screen p-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 items-center">
				<UserIdentifier />
				<h1 className="text-2xl font-bold">AnythingUp</h1>
				<Menubar>
					<MenubarMenu>
						<MenubarTrigger
							className={
								sortBy === "hot" ? "border-2 border-black" : ""
							}
							onClick={() => setSortBy("hot")}
						>
							Hot
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							className={
								sortBy === "new" ? "border-2 border-black" : ""
							}
							onClick={() => setSortBy("new")}
						>
							New
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							className={
								sortBy === "top" ? "border-2 border-black" : ""
							}
							onClick={() => setSortBy("top")}
						>
							Top
						</MenubarTrigger>
						{sortBy === "top" && (
							<MenubarContent>
								<MenubarItem
									onClick={() => setTimePeriod("day")}
								>
									Day
								</MenubarItem>
								<MenubarItem
									onClick={() => setTimePeriod("week")}
								>
									Week
								</MenubarItem>
								<MenubarItem
									onClick={() => setTimePeriod("month")}
								>
									Month
								</MenubarItem>
							</MenubarContent>
						)}
					</MenubarMenu>
					<ThemeSwitcher />
				</Menubar>
				<form
					className="flex flex-col gap-4 w-full max-w-lg"
					onSubmit={handleSubmit}
				>
					<div>
						<label htmlFor="content" className="block font-medium">
							Post Content
						</label>
						<Input
							id="content"
							placeholder="What's on your mind?"
							value={content}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setContent(e.target.value)}
						/>
					</div>
					<div>
						<label htmlFor="tags" className="block font-medium">
							Tags (optional, comma-separated)
						</label>
						<Input
							type="text"
							id="tags"
							placeholder="#Tech, #News"
							value={tags}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setTags(e.target.value)}
						/>
					</div>
					<Button type="submit">Submit Post</Button>
				</form>
				{posts.map((post) => (
					<div
						key={post.id}
						className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg"
					>
						<Card className="flex-1">
							<CardHeader>
								<p>{post.content}</p>
							</CardHeader>
							{post.tags && post.tags.length > 0 && (
								<CardFooter className="flex gap-3 md:gap-5 flex-wrap break-all">
									{showAllTags
										? post.tags.map((tag) => (
												<Card key={tag}>
													<CardContent className="px-4 text-sm">
														<span>#{tag}</span>
													</CardContent>
												</Card>
										  ))
										: post.tags.slice(0, postConfig.initialTagLimit).map((tag) => (
												<Card key={tag}>
													<CardContent className="px-4 text-sm">
														<span>#{tag}</span>
													</CardContent>
												</Card>
										  ))}
									{post.tags.length > postConfig.initialTagLimit && (
										<Button
											size="sm"
											onClick={() => setShowAllTags(!showAllTags)}
											variant={showAllTags ? "default" : "neutral"}
										>
											<Ellipsis />
										</Button>
									)}
								</CardFooter>
							)}
						</Card>
						<div className="flex w-auto flex-col items-center">
							<Card className="w-full text-center">
								<CardContent>
									<p>{post.votes}</p>
								</CardContent>
							</Card>
							<div className="flex gap-2 mt-2">
								<Button
									variant={
										votedPosts[post.id] === "up"
											? "default"
											: "neutral"
									}
									onClick={() => handleUpvote(post.id)}
									size={"icon"}
								>
									<ArrowBigUp />
								</Button>
								<Button
									variant={
										votedPosts[post.id] === "down"
											? "default"
											: "neutral"
									}
									onClick={() => handleDownvote(post.id)}
									size={"icon"}
								>
									<ArrowBigDown />
								</Button>
							</div>
						</div>
					</div>
				))}
			</main>
		</div>
	);
}
