import React from "react";
import PostSkeleton from "@/components/post/PostSkeleton";
import PostError from "@/components/post/PostError";
import PostEmpty from "@/components/post/PostEmpty";

interface PostStatusProps {
	loading: boolean;
	error: string | null;
	empty: boolean;
}

const PostStatus: React.FC<PostStatusProps> = ({ loading, error, empty }) => {
	if (loading) {
		return <PostSkeleton />;
	}

	if (error) {
		return <PostError message={error} />;
	}

	if (empty) {
		return <PostEmpty />;
	}

	return null;
};

export default PostStatus;
