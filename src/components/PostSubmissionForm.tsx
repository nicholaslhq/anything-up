import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PostSubmissionFormProps {
	onSubmit: (event: React.FormEvent) => void;
	content: string;
	setContent: React.Dispatch<React.SetStateAction<string>>;
	tags: string;
	setTags: React.Dispatch<React.SetStateAction<string>>;
}

const PostSubmissionForm: React.FC<PostSubmissionFormProps> = ({
	onSubmit,
	content,
	setContent,
	tags,
	setTags,
}) => {
	return (
		<form
			className="flex flex-col gap-4 w-full max-w-lg"
			onSubmit={onSubmit}
		>
			<div>
				<label htmlFor="content" className="block font-medium">
					Post Content
				</label>
				<Input
					id="content"
					placeholder="What's on your mind?"
					value={content}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setContent(e.target.value)
					}
				/>
			</div>
			<div>
				<label htmlFor="tags" className="block font-medium">
					Tags (optional, comma-separated)
				</label>
				<Input
					type="text"
					id="tags"
					placeholder="#Tech, #News"
					value={tags}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setTags(e.target.value)
					}
				/>
			</div>
			<Button type="submit">Submit Post</Button>
		</form>
	);
};

export default PostSubmissionForm;
