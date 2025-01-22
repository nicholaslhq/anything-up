import React from "react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import PostTags from "@/components/post/PostTags";
import PostVote from "@/components/post/PostVote";
import { Pin } from "lucide-react";

export interface Post {
	id: string;
	content: string;
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	userVote: "UPVOTE" | "DOWNVOTE" | null;
	tags?: string[];
	type: "STANDARD" | "PINNED" | "RESTRICTED";
}

interface PostProps {
	post: Post;
	handleUpvote: (postId: string) => Promise<void>;
	handleDownvote: (postId: string) => Promise<void>;
	onTagClick: (tag: string) => void;
	selectedTag: string | null;
}

const Post: React.FC<PostProps> = ({
	post,
	handleUpvote,
	handleDownvote,
	onTagClick,
	selectedTag,
}) => {
	return (
		<div
			key={post.id}
			className="flex gap-3 md:gap-5 w-full sm:max-w-lg break-all"
		>
			<Card className="flex-1">
				<CardHeader className={"relative [&_svg]:size-5"}>
					{post.type === "PINNED" && (
						<div className="absolute top-2 right-2">
							<Pin />
						</div>
					)}
					<p className="break-words">{post.content}</p>
				</CardHeader>
				<CardFooter>
					<PostTags
						tags={post.tags}
						onTagClick={onTagClick}
						selectedTag={selectedTag}
					/>
				</CardFooter>
			</Card>
			<PostVote
				postId={post.id}
				handleUpvote={handleUpvote}
				handleDownvote={handleDownvote}
				userVote={post.userVote}
				upVotes={post.upVotes}
				downVotes={post.downVotes}
				expiresInDays={post.expiresInDays}
			/>
		</div>
	);
};

export default Post;
