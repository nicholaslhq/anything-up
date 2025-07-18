import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, Frown, SmilePlus, Meh } from "lucide-react";
import PostVoteCount from "@/components/post/PostVoteCount";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PostVoteProps {
	postId: string;
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	userVote: "UPVOTE" | "DOWNVOTE" | null;
	handleUpvote: (postId: string) => Promise<void>;
	handleDownvote: (postId: string) => Promise<void>;
	loading?: boolean;
	error?: boolean;
	empty?: boolean;
	expired?: boolean;
}

const PostVote: React.FC<PostVoteProps> = ({
	postId,
	upVotes: initialUpVotes,
	downVotes: initialDownVotes,
	expiresInDays,
	userVote: initialUserVote,
	handleUpvote,
	handleDownvote,
	loading = false,
	error = false,
	empty = false,
	expired = false,
}) => {
	const [localUpVotes, setLocalUpVotes] = useState(initialUpVotes);
	const [localDownVotes, setLocalDownVotes] = useState(initialDownVotes);
	const [localUserVote, setLocalUserVote] = useState(initialUserVote);

	// Synchronize localUserVote with initialUserVote prop.
	// This ensures that if the userVote prop changes (e.g., after client-side data fetching
	// corrects an initial server-side render mismatch), the component's local state
	// and thus the button display will update accordingly.
	useEffect(() => {
		setLocalUserVote(initialUserVote);
	}, [initialUserVote]);

	const postUrl = postId
		? `${window.location.origin}/posts/${postId}`
		: undefined;
	const { toast } = useToast();

	const onUpvoteClick = async () => {
		const originalUpVotes = localUpVotes;
		const originalDownVotes = localDownVotes;
		const originalUserVote = localUserVote;

		if (localUserVote === "UPVOTE") {
			setLocalUpVotes((prev) => prev - 1);
			setLocalUserVote(null);
		} else if (localUserVote === "DOWNVOTE") {
			setLocalUpVotes((prev) => prev + 1);
			setLocalDownVotes((prev) => prev - 1);
			setLocalUserVote("UPVOTE");
		} else {
			setLocalUpVotes((prev) => prev + 1);
			setLocalUserVote("UPVOTE");
		}

		try {
			await handleUpvote(postId);
		} catch {
			setLocalUpVotes(originalUpVotes);
			setLocalDownVotes(originalDownVotes);
			setLocalUserVote(originalUserVote);
			toast({
				title: "Error upvoting",
				description: "Something went wrong. Please try again.",
				variant: "destructive",
			});
		}
	};

	const onDownvoteClick = async () => {
		const originalUpVotes = localUpVotes;
		const originalDownVotes = localDownVotes;
		const originalUserVote = localUserVote;

		if (localUserVote === "DOWNVOTE") {
			setLocalDownVotes((prev) => prev - 1);
			setLocalUserVote(null);
		} else if (localUserVote === "UPVOTE") {
			setLocalDownVotes((prev) => prev + 1);
			setLocalUpVotes((prev) => prev - 1);
			setLocalUserVote("DOWNVOTE");
		} else {
			setLocalDownVotes((prev) => prev + 1);
			setLocalUserVote("DOWNVOTE");
		}

		try {
			await handleDownvote(postId);
		} catch {
			setLocalUpVotes(originalUpVotes);
			setLocalDownVotes(originalDownVotes);
			setLocalUserVote(originalUserVote);
			toast({
				title: "Error downvoting",
				description: "Something went wrong. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex w-auto flex-col items-center">
			{loading ? (
				<Button variant="neutral" className="w-full" disabled={loading}>
					<Skeleton className="h-4 w-full" />
				</Button>
			) : error ? (
				<Button variant="neutral" className="w-full" disabled={error}>
					<Frown />
				</Button>
			) : empty ? (
				<Button variant="neutral" className="w-full" disabled={empty}>
					<SmilePlus />
				</Button>
			) : expired ? (
				<Button variant="neutral" className="w-full" disabled={expired}>
					<Meh />
				</Button>
			) : (
				<PostVoteCount
					upVotes={localUpVotes}
					downVotes={localDownVotes}
					expiresInDays={expiresInDays}
					postUrl={postUrl}
				/>
			)}
			<div className="flex flex-col sm:flex-row gap-2 mt-2">
				<Button
					variant={localUserVote === "UPVOTE" ? "default" : "neutral"}
					onClick={onUpvoteClick}
					size={"mobileIcon"}
					disabled={loading || error || empty || expired}
				>
					<ArrowBigUp />
				</Button>
				<Button
					variant={
						localUserVote === "DOWNVOTE" ? "default" : "neutral"
					}
					onClick={onDownvoteClick}
					size={"mobileIcon"}
					disabled={loading || error || empty || expired}
				>
					<ArrowBigDown />
				</Button>
			</div>
		</div>
	);
};

export default PostVote;
