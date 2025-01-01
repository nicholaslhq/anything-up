import React from "react";
import PostSkeleton from "./PostSkeleton";
import PostError from "./PostError";

interface PostStatusProps {
  loading: boolean;
  error: string | null;
}

const PostStatus: React.FC<PostStatusProps> = ({ loading, error }) => {
  if (loading) {
    return <PostSkeleton />;
  }

  if (error) {
    return <PostError message={error} />;
  }

  return null;
};

export default PostStatus;
