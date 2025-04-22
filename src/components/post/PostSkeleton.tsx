import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PostVote from "@/components/post/PostVote";

const PostSkeleton: React.FC = () => {
	return (
		<div className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1">
				<CardHeader>
					<Skeleton className="h-5 w-[150px] md:w-[200px] sm:w-[250px]" />
				</CardHeader>
			</Card>
			<PostVote
				postId="loading"
				handleUpvote={() => Promise.resolve()}
				handleDownvote={() => Promise.resolve()}
				userVote={null}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={true}
				error={false}
				empty={false}
				expired={false}
			/>
		</div>
	);
};

export default PostSkeleton;
