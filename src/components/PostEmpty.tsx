import React from "react";
import { Card, CardHeader } from "./ui/card";
import PostVote from "./PostVote";

const PostEmpty = () => {
	return (
		<div className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1">
				<CardHeader>
					<p>Nothing up right now. Create one?</p>
				</CardHeader>
			</Card>
			<PostVote
				postId="empty"
				handleUpvote={() => {}}
				handleDownvote={() => {}}
				votedPosts={{}}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={false}
				error={false}
				empty={true}
			/>
		</div>
	);
};

export default PostEmpty;
