import React from "react";
import { Button } from "./ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import PostVoteCount from "./PostVoteCount";
import { Skeleton } from "./ui/skeleton";

interface PostVoteProps {
	postId: string;
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	votedPosts: { [postId: string]: "up" | "down" | null };
	handleUpvote: (postId: string) => void;
	handleDownvote: (postId: string) => void;
	loading?: boolean;
}

const PostVote: React.FC<PostVoteProps> = ({
	postId,
	upVotes,
	downVotes,
	expiresInDays,
	votedPosts,
	handleUpvote,
	handleDownvote,
	loading = false,
}) => {
	return (
		<div className="flex w-auto flex-col items-center">
			{loading ? (
				<Button variant="neutral" className="w-full" disabled={loading}>
					<Skeleton className="h-4 w-full" />
				</Button>
			) : (
				<PostVoteCount
					upVotes={upVotes}
					downVotes={downVotes}
					expiresInDays={expiresInDays}
				/>
			)}
			<div className="flex gap-2 mt-2">
				<Button
					variant={
						votedPosts[postId] === "up" ? "default" : "neutral"
					}
					onClick={() => handleUpvote(postId)}
					size={"icon"}
					disabled={loading}
				>
					<ArrowBigUp />
				</Button>
				<Button
					variant={
						votedPosts[postId] === "down" ? "default" : "neutral"
					}
					onClick={() => handleDownvote(postId)}
					size={"icon"}
					disabled={loading}
				>
					<ArrowBigDown />
				</Button>
			</div>
		</div>
	);
};

export default PostVote;
