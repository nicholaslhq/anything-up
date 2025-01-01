import React, { useState } from "react";
import { Card, CardHeader, CardFooter } from "./ui/card";
import PostTags from "./PostTags";
import PostVote from "./PostVote";

export interface Post {
	id: string;
	content: string;
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	tags?: string[];
}

interface PostProps {
	post: Post;
	handleUpvote: (postId: string) => Promise<void>;
	handleDownvote: (postId: string) => Promise<void>;
	votedPosts: { [postId: string]: "up" | "down" | null };
}

const Post: React.FC<PostProps> = ({
	post,
	handleUpvote,
	handleDownvote,
	votedPosts,
}) => {
	const [error, setError] = useState<string | null>(null);

	if (error) {
		return (
			<div className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg">
				<Card>
					<CardHeader>
						<p className="text-red-500">Error: {error}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div
			key={post.id}
			className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg"
		>
			<Card className="flex-1">
				<CardHeader>
					<p>{post.content}</p>
				</CardHeader>
				<CardFooter>
					<PostTags tags={post.tags} />
				</CardFooter>
			</Card>
			<PostVote
				postId={post.id}
				handleUpvote={handleUpvote}
				handleDownvote={handleDownvote}
				votedPosts={votedPosts}
				upVotes={post.upVotes}
				downVotes={post.downVotes}
				expiresInDays={post.expiresInDays}
        		error={error !== null}
			/>
		</div>
	);
};

export default Post;
