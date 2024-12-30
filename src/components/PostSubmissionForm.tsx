import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Plus } from "lucide-react";
import postConfig from "@/../config/post.config.json";

interface PostSubmissionFormProps {
	onSubmit: (event: React.FormEvent, tags: string[]) => void;
	content: string;
	setContent: React.Dispatch<React.SetStateAction<string>>;
}

const PostSubmissionForm: React.FC<PostSubmissionFormProps> = ({
	onSubmit,
	content,
	setContent,
}) => {
	const [tagInputs, setTagInputs] = useState<string[]>([""]);
	const tagLimit = postConfig.tagLimit;

	const addTagInput = () => {
		if (tagInputs.every(input => input.trim() !== "") && tagInputs.length < tagLimit) {
			setTagInputs([...tagInputs, ""]);
		}
	};

	const handleTagInputChange = (index: number, value: string) => {
		const newTagInputs = [...tagInputs];
		newTagInputs[index] = value;
		setTagInputs(newTagInputs);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const tagsToAdd = tagInputs.map(input => input.trim()).filter(tag => tag !== "");
		onSubmit(event, tagsToAdd);
	};

	return (
		<div className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							id="content"
							placeholder="What’s happening in your world?"
							value={content}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setContent(e.target.value)}
						/>
					</form>
				</CardHeader>
				<CardFooter>
					<div className="flex flex-row gap-2 flex-wrap break-all">
						{tagInputs.map((tagInput, index) => (
							<div key={index}>
								<Input
									placeholder="Tag"
									prefix="#"
									className="w-24"
									value={tagInput}
									onChange={(e) => handleTagInputChange(index, e.target.value)}
								/>
							</div>
						))}
						{tagInputs.length < tagLimit && (
							<div>
								<Button
									type="button"
									variant="neutral"
									size="icon"
									onClick={addTagInput}
									disabled={tagInputs.some(input => input.trim() === "")}
								>
									<Plus />
								</Button>
							</div>
						)}
					</div>
				</CardFooter>
			</Card>
			<Button type="submit">Submit</Button>
		</div>
	);
};

export default PostSubmissionForm;
