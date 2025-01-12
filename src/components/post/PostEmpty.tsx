import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import PostVote from "@/components/post/PostVote";

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
				userVote={null}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={false}
				error={false}
				empty={true}
				expired={false}
			/>
		</div>
	);
};

export default PostEmpty;
