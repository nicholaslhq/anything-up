import React from "react";
import PostSkeleton from "./PostSkeleton";
import PostError from "./PostError";
import PostEmpty from "./PostEmpty";

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
