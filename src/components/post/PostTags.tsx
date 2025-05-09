"use client";

import React, { useState } from "react";
import { Post } from "@/components/post/Post";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { SETTING_POST_INITIAL_TAG_DISPLAY_LIMIT } from "@/lib/settings";

interface PostTagsProps {
	tags?: Post["tags"];
	onTagClick: (tag: string) => void;
	selectedTag: string | null;
}

const PostTags: React.FC<PostTagsProps> = ({
	tags,
	onTagClick,
	selectedTag,
}) => {
	const [showAllTags, setShowAllTags] = useState(false);

	return (
		<div className="flex gap-2 flex-wrap break-all">
			{tags && tags.length > 0 && (
				<>
					{showAllTags
						? tags.map((tag) => (
								<Button
									key={tag}
									variant={
										selectedTag?.toLowerCase() ===
										tag.toLowerCase()
											? "default"
											: "neutral"
									}
									onClick={() => onTagClick(tag)}
									prefix="#"
								>
									<span>{tag}</span>
								</Button>
						  ))
						: tags
								.slice(
									0,
									SETTING_POST_INITIAL_TAG_DISPLAY_LIMIT
								)
								.map((tag) => (
									<Button
										key={tag}
										variant={
											selectedTag?.toLowerCase() ===
											tag.toLowerCase()
												? "default"
												: "neutral"
										}
										onClick={() => onTagClick(tag)}
										prefix="#"
									>
										<span>{tag}</span>
									</Button>
								))}
					{tags.length > SETTING_POST_INITIAL_TAG_DISPLAY_LIMIT && (
						<Button
							size="icon"
							onClick={() => setShowAllTags(!showAllTags)}
							variant={showAllTags ? "default" : "neutral"}
						>
							<Ellipsis />
						</Button>
					)}
				</>
			)}
		</div>
	);
};

export default PostTags;
