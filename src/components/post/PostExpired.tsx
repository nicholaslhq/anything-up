import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import PostVote from "@/components/post/PostVote";

const PostExpired = () => {
	return (
		<div className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1">
				<CardHeader>
					<p>Post not found or expired</p>
				</CardHeader>
			</Card>
			<PostVote
				postId="expired"
				handleUpvote={() => Promise.resolve()}
				handleDownvote={() => Promise.resolve()}
				userVote={null}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={false}
				error={false}
				empty={false}
				expired={true}
			/>
		</div>
	);
};

export default PostExpired;
