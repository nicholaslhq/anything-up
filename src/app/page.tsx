"use client";

import { useState, useEffect } from "react";
import PostSubmissionForm from "../components/PostSubmissionForm";
import UserIdentifier from "../components/UserIdentifier";
import NavigationBar from "../components/NavigationBar";
import PostComponent, { Post } from "../components/Post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [votedPosts, setVotedPosts] = useState<{
    [postId: string]: "up" | "down" | null;
  }>({});
  const [sortBy, setSortBy] = useState("hot"); // Default sort
  const [timePeriod, setTimePeriod] = useState("day");

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(
        `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
      );
      const data: Post[] = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, [sortBy, timePeriod]);

  const handleUpvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
    // Refresh the posts after the upvote action
    const res = await fetch(
      `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
    );
    const data: Post[] = await res.json();
    setPosts(data);
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: currentVote === "up" ? null : "up",
    }));
  };

  const handleDownvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/downvote`, { method: "POST" });
    // Refresh the posts after the downvote action
    const res = await fetch(
      `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
    );
    const data: Post[] = await res.json();
    setPosts(data);
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: currentVote === "down" ? null : "down",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      alert("Please enter some content for your post.");
      return;
    }
    await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        tags: tags.split(",").map((tag) => tag.trim()),
      }),
    });

    // After submitting, refresh the posts
    const res = await fetch(
      `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
    );
    const data: Post[] = await res.json();
    setPosts(data);
    setContent("");
    setTags("");
  };

  return (
    <div className="min-h-screen p-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <UserIdentifier />
        <h1 className="text-2xl font-bold">AnythingUp</h1>
        <NavigationBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
        />
        <PostSubmissionForm
          onSubmit={handleSubmit}
          content={content}
          setContent={setContent}
          tags={tags}
          setTags={setTags}
        />
        {posts.map((post) => (
          <div
            key={post.id}
            className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg"
          >
            <PostComponent post={post} handleUpvote={handleUpvote} handleDownvote={handleDownvote} votedPosts={votedPosts} />
          </div>
        ))}
      </main>
    </div>
  );
}
