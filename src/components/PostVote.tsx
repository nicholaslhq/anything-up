import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

interface PostVoteProps {
  postId: string;
  votes: number;
  votedPosts: { [postId: string]: "up" | "down" | null };
  handleUpvote: (postId: string) => void;
  handleDownvote: (postId: string) => void;
}

const PostVote: React.FC<PostVoteProps> = ({
  postId,
  votes,
  votedPosts,
  handleUpvote,
  handleDownvote,
}) => {
  return (
    <div className="flex w-auto flex-col items-center">
      <Card className="w-full text-center">
        <CardContent>
          <p>{votes}</p>
        </CardContent>
      </Card>
      <div className="flex gap-2 mt-2">
        <Button
          variant={votedPosts[postId] === "up" ? "default" : "neutral"}
          onClick={() => handleUpvote(postId)}
          size={"icon"}
        >
          <ArrowBigUp />
        </Button>
        <Button
          variant={votedPosts[postId] === "down" ? "default" : "neutral"}
          onClick={() => handleDownvote(postId)}
          size={"icon"}
        >
          <ArrowBigDown />
        </Button>
      </div>
    </div>
  );
};

export default PostVote;