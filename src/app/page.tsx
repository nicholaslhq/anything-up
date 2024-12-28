"use client";

import { useState, useEffect } from 'react';
import UserIdentifier from '@/components/UserIdentifier';

interface Post {
  id: string;
  content: string;
  votes: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [votedPosts, setVotedPosts] = useState<{ [postId: string]: 'up' | 'down' | null }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/posts');
      const data: Post[] = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  const handleUpvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/upvote`, { method: 'POST' });
    // Refresh the posts after the upvote action
    const res = await fetch('/api/posts');
    const data: Post[] = await res.json();
    setPosts(data);
    setVotedPosts(prev => ({
      ...prev,
      [postId]: currentVote === 'up' ? null : 'up',
    }));
  };

  const handleDownvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/downvote`, { method: 'POST' });
    // Refresh the posts after the downvote action
    const res = await fetch('/api/posts');
    const data: Post[] = await res.json();
    setPosts(data);
    setVotedPosts(prev => ({
      ...prev,
      [postId]: currentVote === 'down' ? null : 'down',
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      alert("Please enter some content for your post.");
      return;
    }
    await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, tags: tags.split(',').map(tag => tag.trim()) }),
    });
    
    
    // After submitting, refresh the posts
    const res = await fetch('/api/posts');
    const data: Post[] = await res.json();
    setPosts(data);
    setContent('');
    setTags('');
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <UserIdentifier />
        <h1 className="text-2xl font-bold">AnythingUp</h1>
        <form className="flex flex-col gap-4 w-full max-w-lg" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="content" className="block font-medium text-gray-700">
              Post Content
            </label>
            <textarea
              id="content"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tags" className="block font-medium text-gray-700">
              Tags (optional, comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="#Tech, #News"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Submit Post
          </button>
        </form>
        {posts.map((post) => (
          <div key={post.id} className="mt-10 p-4 border rounded">
            <p>{post.content}</p>
            <div className="flex items-center mt-2">
              <button
                className={`mr-2 px-2 py-1 text-white rounded ${votedPosts[post.id] === 'up' ? 'bg-green-500' : ''}`}
                onClick={() => handleUpvote(post.id)}
              >
                Upvote
              </button>
              <button
                className={`px-2 py-1 text-white rounded ${votedPosts[post.id] === 'down' ? 'bg-red-500' : ''}`}
                onClick={() => handleDownvote(post.id)}
              >
                Downvote
              </button>
              <span className="ml-4">Votes: {post.votes}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
