import React from "react";
import { Card, CardHeader } from "./ui/card";
import PostSkeleton from "./PostSkeleton";

interface PostStatusProps {
  loading: boolean;
  error: string | null;
}

const PostStatus: React.FC<PostStatusProps> = ({ loading, error }) => {
  if (loading) {
    return <PostSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-red-400">
        <CardHeader>
          <p className="text-text">{error}</p>
        </CardHeader>
      </Card>
    );
  }

  return null;
};

export default PostStatus;
