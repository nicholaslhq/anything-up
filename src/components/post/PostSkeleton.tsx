import React from "react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PostVote from "@/components/post/PostVote";

const PostSkeleton: React.FC = () => {
	return (
		<div className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="flex-1">
				<CardHeader>
					<Skeleton className="h-4 w-[150px] sm:w-[200px]" />
				</CardHeader>
				<CardFooter>
					<Skeleton className="h-4 w-[100px]" />
				</CardFooter>
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
