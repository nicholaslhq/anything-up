"use client";

import { useState, useEffect } from "react";
import PostSubmissionForm from "../components/PostSubmissionForm";
import UserIdentifier from "../components/UserIdentifier";
import NavigationBar from "../components/NavigationBar";
import PostComponent from "../components/Post";
import PostStatus from "../components/PostStatus";
import postConfig from "../../config/post.config.json";

export interface Post {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  votes: number;
  status: string;
  expiredAt: Date;
  tags: string[];
  upVotes: number;
  downVotes: number;
  expiresInDays: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [content, setContent] = useState("");
  const postLoadingTimeout = postConfig.postLoadingTimeout;
  const [votedPosts, setVotedPosts] = useState<{
    [postId: string]: "up" | "down" | null;
  }>({});
  const [sortBy, setSortBy] = useState("hot"); // Default sort
  const [timePeriod, setTimePeriod] = useState("day");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      let timeoutId: NodeJS.Timeout | null = null;
      if (postLoadingTimeout) {
        timeoutId = setTimeout(() => {
          setError("Failed to load posts. Please check your connection.");
          setLoading(false);
        }, postLoadingTimeout);
      }
      try {
        const res = await fetch(
          `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
        );
        if (!res.ok) {
          const message = `Failed to fetch posts: ${res.status} ${res.statusText}`;
          setError(message);
        } else {
          const data: Post[] = await res.json();
          setPosts(data);
          setEmpty(data.length === 0);
        }
      } catch (e: unknown) {
        console.error("Failed to fetch posts:", e);
        setError("Failed to load posts. Please check your connection.");
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy, timePeriod, postLoadingTimeout]);

  const handleUpvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          if (currentVote === "up") {
            return { ...post, upVotes: post.upVotes - 1 };
          } else if (currentVote === "down") {
            return { ...post, downVotes: post.downVotes - 1, upVotes: post.upVotes + 1 };
          } else {
            return { ...post, upVotes: post.upVotes + 1 };
          }
        }
        return post;
      })
    );
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: currentVote === "up" ? null : "up",
    }));
  };

  const handleDownvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/downvote`, { method: "POST" });
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          if (currentVote === "down") {
            return { ...post, downVotes: post.downVotes - 1 };
          } else if (currentVote === "up") {
            return { ...post, upVotes: post.upVotes - 1, downVotes: post.downVotes + 1 };
          } else {
            return { ...post, downVotes: post.downVotes + 1 };
          }
        }
        return post;
      })
    );
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: currentVote === "down" ? null : "down",
    }));
  };

  const handleSubmit = async (event: React.FormEvent, tags: string[]) => {
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
        tags,
      }),
    });

    // After submitting, refresh the posts
    const res = await fetch(
      `/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`
    );
    const data: Post[] = await res.json();
    setPosts(data);
    setEmpty(data.length === 0);
    setContent("");
  };

  return (
    <div className="min-h-screen p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-16 items-center">
        <UserIdentifier />
        <h1 className="text-2xl font-bold text-text">AnythingUp</h1>
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
        />
        {loading ? (
          <PostStatus error={error} loading={loading} empty={empty} />
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex w-full sm:max-w-lg">
              <PostComponent
                post={post}
                handleUpvote={handleUpvote}
                handleDownvote={handleDownvote}
                votedPosts={votedPosts}
              />
            </div>
          ))
        )}
      </main>
    </div>
  );
}
