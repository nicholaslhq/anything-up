import React from "react";
import { Card, CardHeader, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import PostVote from "./PostVote";

const PostSkeleton: React.FC = () => {
	return (
		<div className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1">
				<CardHeader>
					<Skeleton className="h-4 w-[200px]" />
				</CardHeader>
				<CardFooter>
					<Skeleton className="h-4 w-[100px]" />
				</CardFooter>
			</Card>
			<PostVote
				postId="loading"
				handleUpvote={() => {}}
				handleDownvote={() => {}}
				votedPosts={{}}
				upVotes={0}
				downVotes={0}
				expiresInDays={0}
				loading={true}
			/>
		</div>
	);
};

export default PostSkeleton;
