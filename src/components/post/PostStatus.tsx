import React from "react";
import PostSkeleton from "@/components/post/PostSkeleton";
import PostError from "@/components/post/PostError";
import PostEmpty from "@/components/post/PostEmpty";
import PostExpired from "@/components/post/PostExpired";

interface PostStatusProps {
	loading: boolean;
	error: string | null;
	empty: boolean;
	expired: boolean;
}

const PostStatus: React.FC<PostStatusProps> = ({
	loading,
	error,
	empty,
	expired,
}) => {
	if (loading) {
		return <PostSkeleton />;
	}

	if (error) {
		return <PostError />;
	}

	if (empty) {
		return <PostEmpty />;
	}

	if (expired) {
		return <PostExpired />;
	}

	return null;
};

export default PostStatus;
