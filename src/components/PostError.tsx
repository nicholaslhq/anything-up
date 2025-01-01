import React from "react";
import { Card, CardHeader } from "./ui/card";
import PostVote from "./PostVote";

interface PostErrorProps {
	message: string;
}

const PostError: React.FC<PostErrorProps> = ({ message }) => {
	return (
		<div className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1 bg-red-300">
				<CardHeader>
					<p>Error: {message}</p>
				</CardHeader>
			</Card>
			<PostVote
				postId="error"
				handleUpvote={() => {}}
				handleDownvote={() => {}}
				votedPosts={{}}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={false}
				error={true}
				empty={false}
			/>
		</div>
	);
};

export default PostError;
