import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; // Import the Textarea component
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Plus, Send, Eraser } from "lucide-react";

const POST_SETTING_NEW_TAG_LIMIT = 5;
const POST_SETTING_MAX_CONTENT_LENGTH = 300;

interface PostSubmissionFormProps {
	onSubmit: (event: React.FormEvent, tags: string[]) => Promise<void>;
	content: string;
	setContent: React.Dispatch<React.SetStateAction<string>>;
	isVisible: boolean;
	onVisibilityChange: (isVisible: boolean) => void;
}

const PostSubmissionForm: React.FC<PostSubmissionFormProps> = ({
	onSubmit,
	content,
	setContent,
	isVisible,
	onVisibilityChange,
}) => {
	const [postContentLength, setPostContentLength] = useState(0);
	const [tagInputs, setTagInputs] = useState<string[]>([]);
	const [tagErrors, setTagErrors] = useState<string[]>([]);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const clearForm = React.useCallback(() => {
		setContent("");
		if (textareaRef.current) {
			textareaRef.current.value = "";
		}
		setPostContentLength(0);
		setTagInputs([]);
		setTagErrors([]);
	}, [
		setContent,
		textareaRef,
		setPostContentLength,
		setTagInputs,
		setTagErrors,
	]);

	useEffect(() => {
		if (!isVisible) {
			clearForm();
		}
	}, [isVisible, clearForm]);

	const tagInputRefs = useRef<HTMLInputElement[]>([]);

	const addTagInput = () => {
		if (tagInputs.length < POST_SETTING_NEW_TAG_LIMIT) {
			setTagInputs([...tagInputs, ""]);
			setTagErrors([...tagErrors, ""]);
			// Focus on the last input after it's added
			setTimeout(() => {
				if (!tagInputRefs.current) {
					tagInputRefs.current = [];
				}
				if (tagInputRefs.current.length > 0) {
					tagInputRefs.current[tagInputs.length].focus();
				}
			}, 0);
		}
	};

	const handleTagInputChange = (index: number, value: string) => {
		const newTagInputs = [...tagInputs];
		const newTagErrors = [...tagErrors];
		const regex = /[^a-zA-Z0-9]/g;
		if (regex.test(value)) {
			newTagErrors[index] = "Only alphanumeric characters are allowed.";
		} else {
			newTagErrors[index] = "";
		}
		newTagInputs[index] = value;
		setTagInputs(newTagInputs);
		setTagErrors(newTagErrors);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const tagsToAdd = tagInputs
			.map((input) => input.trim())
			.filter((tag) => tag !== "");
		const uniqueTagsToAdd = [...new Set(tagsToAdd)]; // Eliminate duplicates
		await onSubmit(event, uniqueTagsToAdd);
		if (textareaRef.current) {
			textareaRef.current.value = "";
		}
		setContent("");
		setPostContentLength(0);
		setTagInputs([]);
		setTagErrors([]);
		onVisibilityChange(false);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (!isVisible) {
		return null;
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex gap-3 md:gap-5 w-full sm:max-w-lg"
		>
			<Card className="w-full max-w-lg">
				<CardHeader>
					<Textarea
						id="content"
						placeholder="What’s happening in your world?"
						value={content}
						onChange={(
							e: React.ChangeEvent<HTMLTextAreaElement>
						) => {
							const inputValue = e.target.value;
							if (
								inputValue.length <=
								POST_SETTING_MAX_CONTENT_LENGTH
							) {
								setContent(inputValue);
								setPostContentLength(inputValue.length);
							} else {
								setContent(
									inputValue.slice(
										0,
										POST_SETTING_MAX_CONTENT_LENGTH
									)
								);
								setPostContentLength(
									POST_SETTING_MAX_CONTENT_LENGTH
								);
							}
						}}
						autoExpand
						minHeight={40}
						maxHeight={200}
						ref={textareaRef}
					/>
				</CardHeader>
				<CardFooter>
					<div className="flex flex-row gap-2 flex-wrap break-all">
						{tagInputs.length > 0 &&
							tagInputs.map((tagInput, index) => (
								<div key={index}>
									<Input
										ref={(el) => {
											if (el) {
												if (!tagInputRefs.current) {
													tagInputRefs.current = [];
												}
												tagInputRefs.current[index] =
													el;
											}
										}}
										placeholder="Tag"
										prefix="#"
										className={`w-24 ${
											tagErrors[index] ? "bg-red-300" : ""
										}`}
										value={tagInput}
										onChange={(e) =>
											handleTagInputChange(
												index,
												e.target.value
											)
										}
									/>
								</div>
							))}
						{tagInputs.length < POST_SETTING_NEW_TAG_LIMIT && (
							<div>
								<Button
									type="button"
									variant="neutral"
									size="icon"
									onClick={addTagInput}
									disabled={
										tagInputs.some(
											(input) => input.trim() === ""
										) && tagInputs.length > 0
									}
								>
									<Plus />
								</Button>
							</div>
						)}
					</div>
				</CardFooter>
			</Card>
			<div className="flex w-auto flex-col items-center">
				<Button
					className="w-full"
					variant="neutral"
					onClick={(e) => {
						e.preventDefault();
					}}
				>
					<div className="text-sm text-gray-500">
						{postContentLength}/{POST_SETTING_MAX_CONTENT_LENGTH}
					</div>
				</Button>
				<div className="flex gap-2 mt-2">
					<Button
						type="submit"
						size="icon"
						variant="neutral"
						className="[&_svg]:size-5"
						disabled={
							tagErrors.some((error) => error !== "") ||
							content.trim() === ""
						}
					>
						<Send />
					</Button>
					<Button
						type="button"
						size="icon"
						variant="neutral"
						className="[&_svg]:size-5"
						onClick={(e) => {
							e.preventDefault();
							clearForm();
						}}
						disabled={content.trim() === ""}
					>
						<Eraser />
					</Button>
				</div>
			</div>
		</form>
	);
};

export default PostSubmissionForm;
