import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; // Import the Textarea component
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Plus } from "lucide-react";
import postConfig from "../../config/post.config.json";

const maxPostContentLength = postConfig.maxPostContentLength;

interface PostSubmissionFormProps {
  onSubmit: (
    event: React.FormEvent,
    tags: string[]
  ) => Promise<void>;
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
  const newPostTagLimit = postConfig.newPostTagLimit;
  const tagInputRefs = useRef<HTMLInputElement[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addTagInput = () => {
    if (tagInputs.length < newPostTagLimit) {
      setTagInputs([...tagInputs, ""]);
      setTagErrors([...tagErrors, ""]);
      // Focus on the last input after it's added
      setTimeout(() => {
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
    const tagsToAdd = tagInputs.map(input => input.trim()).filter(tag => tag !== "");
    await onSubmit(event, tagsToAdd);
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    setContent("");
    setPostContentLength(0);
    setTagInputs([]);
    setTagErrors([]);
    onVisibilityChange(false); // Hide the form after submission
  };

  if (!isVisible) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 md:gap-5 w-full sm:max-w-lg">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Textarea // Replace Input with Textarea
            id="content"
            placeholder="What’s happening in your world?"
            value={content}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement> // Update event type
            ) => {
              const inputValue = e.target.value;
              if (inputValue.length <= maxPostContentLength) {
                setContent(inputValue);
                setPostContentLength(inputValue.length);
              } else {
                setContent(inputValue.slice(0, maxPostContentLength));
                setPostContentLength(maxPostContentLength);
              }
            }}
            autoExpand={true}
            minHeight={40}
            maxHeight={200}
            ref={textareaRef}
          />
          <div className="text-sm text-gray-500">
            {postContentLength}/{maxPostContentLength}
          </div>
        </CardHeader>
        <CardFooter>
          <div className="flex flex-row gap-2 flex-wrap break-all">
            {tagInputs.length > 0 && tagInputs.map((tagInput, index) => (
              <div key={index}>
                <Input
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
                  className={`w-24 ${tagErrors[index] ? 'bg-red-300' : ''}`}
                  value={tagInput}
                  onChange={(e) => handleTagInputChange(index, e.target.value)}
                />
              </div>
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
      <Button type="submit" disabled={tagErrors.some(error => error !== "") || content.trim() === ""}>Submit</Button>
    </form>
  );
};

export default PostSubmissionForm;
