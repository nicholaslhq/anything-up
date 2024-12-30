import React, { useState, useRef, useEffect } from "react";
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
	const [tagInputs, setTagInputs] = useState<string[]>([]);
	const newPostTagLimit = postConfig.newPostTagLimit;
	const tagInputRefs = useRef<HTMLInputElement[]>([]);

	const addTagInput = () => {
		if (tagInputs.length < newPostTagLimit) {
			setTagInputs([...tagInputs, ""]);
		}
	};

	useEffect(() => {
		if (tagInputs.length > 0 && tagInputRefs.current[tagInputs.length - 1]) {
			tagInputRefs.current[tagInputs.length - 1].focus();
		}
	}, [tagInputs]);

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
						{tagInputs.length > 0 && tagInputs.map((tagInput, index) => (
							<Input
								key={index}
								ref={(el) => {
									if (el) {
										if (!tagInputRefs.current) {
											tagInputRefs.current = [];
										}
										tagInputRefs.current[index] = el;
									}
								}}
								placeholder="Tag"
								prefix="#"
								className="w-24"
								value={tagInput}
								onChange={(e) => handleTagInputChange(index, e.target.value)}
							/>
						))}
						{tagInputs.length < newPostTagLimit && (
							<div>
								<Button
									type="button"
									variant="neutral"
									size="icon"
									onClick={addTagInput}
									disabled={tagInputs.some(input => input.trim() === "") && tagInputs.length > 0}
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
