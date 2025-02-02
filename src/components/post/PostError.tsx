import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import PostVote from "@/components/post/PostVote";


const PostError: React.FC = () => {
	return (
		<div className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1 bg-red-300 dark:bg-red-800">
				<CardHeader>
					<p>Oops! Something went wrong</p>
				</CardHeader>
			</Card>
			<PostVote
				postId="error"
				handleUpvote={() => Promise.resolve()}
				handleDownvote={() => Promise.resolve()}
				userVote={null}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={false}
				error={true}
				empty={false}
				expired={false}
			/>
		</div>
	);
};

export default PostError;
