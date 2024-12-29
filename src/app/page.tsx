"use client";

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import UserIdentifier from '../components/UserIdentifier';
import ThemeSwitcher from '../components/ThemeSwitcher';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../components/ui/menubar';

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
  const [sortBy, setSortBy] = useState('hot'); // Default sort
  const [timePeriod, setTimePeriod] = useState('day');

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`);
      const data: Post[] = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, [sortBy, timePeriod]);

  const handleUpvote = async (postId: string) => {
    const currentVote = votedPosts[postId];
    await fetch(`/api/posts/${postId}/upvote`, { method: 'POST' });
    // Refresh the posts after the upvote action
    const res = await fetch(`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`);
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
    const res = await fetch(`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`);
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
    const res = await fetch(`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}`);
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
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className={sortBy === 'hot' ? 'border-2 border-black' : ''} onClick={() => setSortBy('hot')}>
              Hot
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={sortBy === 'new' ? 'border-2 border-black' : ''} onClick={() => setSortBy('new')}>
              New
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={sortBy === 'top' ? 'border-2 border-black' : ''} onClick={() => setSortBy('top')}>
              Top
            </MenubarTrigger>
            {sortBy === 'top' && (
              <MenubarContent>
                <MenubarItem onClick={() => setTimePeriod('day')}>Day</MenubarItem>
                <MenubarItem onClick={() => setTimePeriod('week')}>Week</MenubarItem>
                <MenubarItem onClick={() => setTimePeriod('month')}>Month</MenubarItem>
              </MenubarContent>
            )}
          </MenubarMenu>
          <ThemeSwitcher />
        </Menubar>
        <form className="flex flex-col gap-4 w-full max-w-lg" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="content" className="block font-medium">
              Post Content
            </label>
            <Input
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            />
          </div>
          <Button type="submit">
            Submit Post
          </Button>
        </form>
        {posts.map((post) => (
          <Card key={post.id} className="mt-10">
            <CardContent>
              <p>{post.content}</p>
              <div className="flex items-center mt-2">
                <Button
                  variant={votedPosts[post.id] === 'up' ? 'neutral' : 'default'}
                  onClick={() => handleUpvote(post.id)}
                >
                  Upvote
                </Button>
                <Button
                  variant={votedPosts[post.id] === 'down' ? 'neutral' : 'default'}
                  onClick={() => handleDownvote(post.id)}
                >
                  Downvote
                </Button>
                <span className="ml-4">Votes: {post.votes}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
