import React from 'react';
import { useState } from "react";
import { Post } from './Post';
import {
	Card,
	CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Ellipsis } from "lucide-react";
import postConfig from "../../config/post.config.json";


interface PostTagsProps {
  tags?: Post['tags'];
}

const PostTags: React.FC<PostTagsProps> = ({ tags }) => {
  const [showAllTags, setShowAllTags] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div>
      {tags && tags.length > 0 && (
      <div className="flex gap-2 flex-wrap break-all">
        {showAllTags
          ? tags.map((tag) => (
              <Card key={tag}>
                <CardContent className="px-4 text-sm">
                  <span>#{tag}</span>
                </CardContent>
              </Card>
            ))
          : tags.slice(0, postConfig.initialTagLimit).map((tag) => (
              <Card key={tag}>
                <CardContent className="px-4 text-sm">
                  <span>#{tag}</span>
                </CardContent>
              </Card>
            ))}
        {tags.length > postConfig.initialTagLimit && (
          <Button
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            variant={showAllTags ? "default" : "neutral"}
          >
            <Ellipsis />
          </Button>
        )}
      </div>
    )}
    </div>
  );
};

export default PostTags;