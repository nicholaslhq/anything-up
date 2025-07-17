"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PostForm from "@/components/post/PostForm";
import UserIdentifier from "@/components/UserIdentifier";
import NavigationBar from "@/components/NavigationBar";
import Title from "@/components/Title";
import PostComponent, { Post as PostType } from "@/components/post/Post";
import PostStatus from "@/components/post/PostStatus";
import PostFooter from "@/components/post/PostFooter";
import { useToast } from "@/hooks/use-toast";
import {
	SETTING_POST_LOADING_TIMEOUT,
	SETTING_POST_PAGE_SIZE,
	SETTING_POST_PREFETCH_DISTANCE,
} from "@/lib/settings";

export interface Post {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	content: string;
	votes: number;
	type: "STANDARD" | "PINNED" | "RESTRICTED";
	expiredAt: Date;
	tags: string[];
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
	userVote: "UPVOTE" | "DOWNVOTE" | null;
}

export default function Home() {
	const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([]);
	const [standardPosts, setStandardPosts] = useState<PostType[]>([]);
	const [loading, setLoading] = useState(false); // Initial load loading
	const loadingRef = useRef(loading); // Ref to track loading state for timeout
	const [empty, setEmpty] = useState(false);
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
	const [sortBy, setSortBy] = useState<string>("");
	const [refreshPosts, setRefreshPosts] = useState(false);
	const [timePeriod, setTimePeriod] = useState("day");
	const [error, setError] = useState<string | null>(null); // Initial load error
	// const [expired, setExpired] = useState(false); // Removed unused state
	const [isUserIdAvailable, setIsUserIdAvailable] = useState(false);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const { toast } = useToast();
	const postFormRef = useRef<HTMLFormElement>(null);
	const [page, setPage] = useState(1); // Current page for pagination
	const [hasMore, setHasMore] = useState(true); // Flag to indicate if more posts can be loaded
	const [loadingMore, setLoadingMore] = useState(false); // Loading state for subsequent fetches
	const [loadMoreError, setLoadMoreError] = useState<string | null>(null); // Error state for subsequent fetches

	useEffect(() => {
		loadingRef.current = loading;
	}, [loading]); // Keep ref updated

	// --- New Function: fetchMorePosts (Moved Before lastPostElementRef) ---
	const fetchMorePosts = useCallback(
		async (isRetry = false) => {
			// Wrapped in useCallback
			if (loading || loadingMore || !hasMore) {
				// console.log("fetchMorePosts skipped:", { loading, loadingMore, hasMore });
				return;
			}

			// console.log(`Fetching more posts: page=${page + 1}`);
			setLoadingMore(true);
			setLoadMoreError(null);
			let res: Response | null = null; // Define res outside try block

			try {
				const nextPage = page + 1;
				const tagQuery = selectedTag ? `&tag=${selectedTag}` : ""; // Add tag query parameter
				res = await fetch(
					// Assign to outer res
					`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}&page=${nextPage}&limit=${SETTING_POST_PREFETCH_DISTANCE}${tagQuery}`
				);

				if (!res.ok) {
					if (!isRetry) {
						// console.log("Fetch more failed, scheduling retry...");
						setTimeout(() => fetchMorePosts(true), 2000); // Retry after 2s
						// Don't set loadingMore to false yet
						return; // Exit function early, wait for retry
					} else {
						// console.log("Fetch more retry failed.");
						const message = `Failed to load more posts: ${res.status} ${res.statusText}`;
						setLoadMoreError(message);
						setHasMore(false); // Stop trying if retry fails
						setLoadingMore(false); // Set loading false on final failure
						return; // Exit
					}
				}

				const newPosts: PostType[] = await res.json();
				// console.log("More posts received:", newPosts.length);

				// Filter out potential duplicates
				const uniqueNewPosts = newPosts.filter(
					(newPost) =>
						!standardPosts.some(
							(existingPost) => existingPost.id === newPost.id
						) &&
						!pinnedPosts.some(
							(existingPinnedPost) =>
								existingPinnedPost.id === newPost.id
						)
				);

				setStandardPosts((prevPosts) => [
					...prevPosts,
					...uniqueNewPosts,
				]);
				setPage(nextPage);
				setHasMore(
					uniqueNewPosts.length === SETTING_POST_PREFETCH_DISTANCE
				); // Check if the batch was full
				setLoadMoreError(null); // Clear error on success
				setLoadingMore(false); // Set loading false on success
			} catch (e: unknown) {
				console.error("Failed to fetch more posts:", e);
				if (!isRetry) {
					// console.log("Fetch more caught error, scheduling retry...");
					setTimeout(() => fetchMorePosts(true), 2000); // Retry after 2s
					// Don't set loadingMore to false yet
					return; // Exit function early, wait for retry
				} else {
					// console.log("Fetch more retry caught error.");
					setLoadMoreError(
						"Failed to load more posts. Please check your connection."
					);
					setHasMore(false); // Stop trying if retry fails
					setLoadingMore(false); // Set loading false on final failure
					return; // Exit
				}
			}
			// }, [page, hasMore, loading, loadingMore, sortBy, timePeriod, standardPosts, pinnedPosts]); // Dependencies for useCallback
		},
		[
			page,
			hasMore,
			loading,
			loadingMore,
			sortBy,
			timePeriod,
			selectedTag,
			standardPosts,
			pinnedPosts,
		]
	); // Removed fetchMorePosts from its own dependency array

	const observer = useRef<IntersectionObserver | null>(null); // Initialize with null
	const lastPostElementRef = useCallback(
		// Ref for the element to observe
		(node: HTMLDivElement | null) => {
			// Allow null for initial render/disconnect
			if (loading || loadingMore) return; // Don't observe if already loading initial or more
			if (observer.current) observer.current.disconnect(); // Disconnect previous observer

			observer.current = new IntersectionObserver(
				(entries) => {
					if (
						entries[0].isIntersecting &&
						hasMore &&
						!loadingMore &&
						!loadMoreError &&
						!loading
					) {
						// Also check !loading
						// console.log("IntersectionObserver triggered: Fetching more posts");
						fetchMorePosts();
					}
				},
				{ threshold: 0.1 }
			); // Trigger slightly before fully visible

			if (node) observer.current.observe(node); // Observe the new node
		},
		[loading, loadingMore, hasMore, loadMoreError, fetchMorePosts] // Added fetchMorePosts to dependencies
	);

	useEffect(() => {
		const storedSortBy = localStorage.getItem("sortBy");
		if (storedSortBy) {
			setSortBy(storedSortBy);
		} else {
			setSortBy("hot");
		}
	}, []);

	useEffect(() => {
		setIsUserIdAvailable(true);
	}, []);

	// --- Modified Initial Fetch useEffect ---
	useEffect(() => {
		if (!isUserIdAvailable || !sortBy) {
			// Ensure sortBy is also available
			return;
		}

		const fetchInitialPosts = async () => {
			setLoading(true);
			setError(null);
			setPinnedPosts([]); // Clear pinned posts on new initial fetch
			setStandardPosts([]); // Clear standard posts on new initial fetch
			setPage(1); // Reset page number for new sort/filter
			setHasMore(true); // Assume there are more posts initially
			setLoadMoreError(null); // Clear load more error
			setLoadingMore(false); // Ensure loading more is false
			const timeoutId = setTimeout(() => {
				if (loadingRef.current) {
					// Check if still loading using ref
					setError(
						"Failed to load posts. Please check your connection."
					);
					setLoading(false);
					setHasMore(false);
				}
			}, SETTING_POST_LOADING_TIMEOUT);

			try {
				// Fetch initial batch
				const tagQuery = selectedTag ? `&tag=${selectedTag}` : ""; // Add tag query parameter
				const res = await fetch(
					`/api/posts?sortBy=${sortBy}&timePeriod=${timePeriod}&page=1&limit=${SETTING_POST_PAGE_SIZE}${tagQuery}`
				);
				clearTimeout(timeoutId); // Clear timeout on successful response start

				if (!res.ok) {
					const message = `Failed to fetch posts: ${res.status} ${res.statusText}`;
					setError(message);
					setHasMore(false); // Stop trying if initial fetch fails
				} else {
					const data: PostType[] = await res.json();
					// console.log("Initial posts received:", data.length);
					const pinnedPostsData = data.filter(
						(post) => post.type === "PINNED"
					);
					const standardPostsData = data.filter(
						(post) => post.type === "STANDARD"
					);

					setPinnedPosts(pinnedPostsData);
					setStandardPosts(standardPostsData); // Set initial standard posts
					// Filtering will be handled by the other useEffect

					setEmpty(
						pinnedPostsData.length === 0 &&
							standardPostsData.length === 0
					);
					// Determine hasMore based on standard posts only, as pinned are separate
					setHasMore(
						standardPostsData.length === SETTING_POST_PAGE_SIZE
					);
					// setExpired(false); // Removed - setExpired is not defined
					setError(null); // Clear error on success
				}
			} catch (e: unknown) {
				clearTimeout(timeoutId); // Clear timeout on error
				console.error("Failed to fetch initial posts:", e);
				setError("Failed to load posts. Please check your connection.");
				setHasMore(false); // Stop trying on catch
			} finally {
				setLoading(false);
				setRefreshPosts(false); // Reset refresh trigger
			}
		};

		fetchInitialPosts();
	}, [sortBy, timePeriod, isUserIdAvailable, refreshPosts, selectedTag]);

	// --- fetchMorePosts is now defined above lastPostElementRef ---

	const handleUpvote = async (postId: string) => {
		const res = await fetch(`/api/posts/${postId}/upvote`, {
			method: "POST",
		});
		if (res.status === 429) {
			const errorData = await res.json();
			if (errorData.error === "RATE_LIMIT_EXCEEDED") {
				toast({
					title: "Too many votes",
					description:
						"You're voting too frequently. Please try again later.",
					variant: "destructive",
				});
				return;
			}
		}
		if (!res.ok && res.status !== 429) {
			toast({
				title: "Vote failed",
				description: "Could not record upvote.",
				variant: "destructive",
			});
			return; // Don't update UI if vote failed server-side
		}
		setStandardPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					const alreadyUpvoted = post.userVote === "UPVOTE";
					const alreadyDownvoted = post.userVote === "DOWNVOTE";
					return {
						...post,
						userVote: alreadyUpvoted ? null : "UPVOTE",
						upVotes: alreadyUpvoted
							? post.upVotes - 1
							: alreadyDownvoted
							? post.upVotes + 1
							: post.upVotes + 1,
						downVotes: alreadyDownvoted
							? post.downVotes - 1
							: post.downVotes,
					};
				}
				return post;
			})
		);
		// Also update pinned posts if the upvoted post was pinned
		setPinnedPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					const alreadyUpvoted = post.userVote === "UPVOTE";
					const alreadyDownvoted = post.userVote === "DOWNVOTE";
					return {
						...post,
						userVote: alreadyUpvoted ? null : "UPVOTE",
						upVotes: alreadyUpvoted
							? post.upVotes - 1
							: alreadyDownvoted
							? post.upVotes + 1
							: post.upVotes + 1,
						downVotes: alreadyDownvoted
							? post.downVotes - 1
							: post.downVotes,
					};
				}
				return post;
			})
		);
	};

	const handleDownvote = async (postId: string) => {
		const res = await fetch(`/api/posts/${postId}/downvote`, {
			method: "POST",
		});
		if (res.status === 429) {
			const errorData = await res.json();
			if (errorData.error === "RATE_LIMIT_EXCEEDED") {
				toast({
					title: "Too many votes",
					description:
						"You're voting too frequently. Please try again later.",
					variant: "destructive",
				});
				return;
			}
		}
		if (!res.ok && res.status !== 429) {
			toast({
				title: "Vote failed",
				description: "Could not record downvote.",
				variant: "destructive",
			});
			return; // Don't update UI if vote failed server-side
		}
		setStandardPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					const alreadyUpvoted = post.userVote === "UPVOTE";
					const alreadyDownvoted = post.userVote === "DOWNVOTE";
					return {
						...post,
						userVote: alreadyDownvoted ? null : "DOWNVOTE",
						downVotes: alreadyDownvoted
							? post.downVotes - 1
							: alreadyUpvoted
							? post.downVotes + 1
							: post.downVotes + 1,
						upVotes: alreadyUpvoted
							? post.upVotes - 1
							: post.upVotes,
					};
				}
				return post;
			})
		);
		// Also update pinned posts if the downvoted post was pinned
		setPinnedPosts((prevPosts) =>
			prevPosts.map((post) => {
				if (post.id === postId) {
					const alreadyUpvoted = post.userVote === "UPVOTE";
					const alreadyDownvoted = post.userVote === "DOWNVOTE";
					return {
						...post,
						userVote: alreadyDownvoted ? null : "DOWNVOTE",
						downVotes: alreadyDownvoted
							? post.downVotes - 1
							: alreadyUpvoted
							? post.downVotes + 1
							: post.downVotes + 1,
						upVotes: alreadyUpvoted
							? post.upVotes - 1
							: post.upVotes,
					};
				}
				return post;
			})
		);
	};

	const handleSubmit = async (
		event: React.FormEvent,
		tags: string[]
	): Promise<boolean> => {
		event.preventDefault();
		if (!content.trim()) {
			toast({
				title: "Empty Post",
				description: "Cannot submit an empty post.",
				variant: "destructive",
			});
			return false; // Indicate failure
		}
		setIsSubmitting(true); // Set submitting to true
		try {
			const res = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content,
					tags,
				}),
			});

			if (res.status === 429) {
				const errorData = await res.json();
				if (errorData.error === "RATE_LIMIT_EXCEEDED") {
					toast({
						title: "Too many posts",
						description:
							"You're posting too frequently. Please try again later.",
						variant: "destructive",
					});
					return false; // Indicate failure
				}
			}

			if (!res.ok) {
				const errorData = await res.json();
				if (
					res.status === 429 &&
					errorData.error === "RATE_LIMIT_EXCEEDED"
				) {
					toast({
						title: "Too many posts",
						description:
							"You're posting too frequently. Please try again later.",
						variant: "destructive",
					});
					return false; // Indicate failure
				}
				if (
					res.status === 409 &&
					errorData.error === "DUPLICATE_POST"
				) {
					toast({
						title: "Duplicate Post",
						description:
							"You already have an active post with the same content.",
						variant: "destructive",
					});
					return false; // Indicate failure
				}
				// Handle other non-OK responses
				toast({
					title: "Submission Failed",
					description: "Could not submit post.",
					variant: "destructive",
				});
				return false; // Indicate failure
			}

			// If submission was successful (res.ok is true)
			toast({
				title: "It’s Up!",
				description: "Your world is up for everyone to see",
			});

			const newPost = await res.json();
			// Add to standard posts, even if a filter is active. The filter useEffect will handle visibility.
			setStandardPosts((prevPosts) => [newPost, ...prevPosts]);
			return true; // Indicate success
		} catch (error) {
			console.error("Post submission failed:", error);
			toast({
				title: "Submission Failed",
				description: "An unexpected error occurred.",
				variant: "destructive",
			});
			return false; // Indicate failure
		} finally {
			setIsSubmitting(false); // Set submitting to false in finally block
		}
	};

	const handleTagClick = (tag: string) => {
		setSelectedTag((prevSelectedTag) =>
			prevSelectedTag === tag ? null : tag
		);
		// When a tag is clicked/unclicked, a new fetch will be triggered by the useEffect
		// window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top
	};

	// postsToRender will always be standardPosts as filtering is now server-side
	const postsToRender = standardPosts;

	return (
		<div className="min-h-screen p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-10 items-center">
				<UserIdentifier />
				<Title
					setRefreshPosts={setRefreshPosts}
					loading={loading || loadingMore}
				/>{" "}
				{/* Show loading in title if initial or more */}
				<NavigationBar
					sortBy={sortBy}
					setSortBy={setSortBy} // Changing sort/time resets posts via useEffect
					timePeriod={timePeriod}
					setTimePeriod={setTimePeriod}
					refreshPosts={refreshPosts}
					setRefreshPosts={setRefreshPosts}
				/>
				<PostForm
					handleSubmit={handleSubmit}
					content={content}
					setContent={setContent}
					ref={postFormRef}
					isSubmitting={isSubmitting} // Pass submitting state
				/>
				{/* Initial Loading State (only when no posts loaded yet) */}
				{loading &&
					standardPosts.length === 0 &&
					pinnedPosts.length === 0 && (
						<div className="w-full sm:max-w-lg">
							<PostStatus
								loading={true}
								error={null}
								empty={false}
								expired={false}
							/>
						</div>
					)}
				{/* Initial Error State (only when no posts loaded yet) */}
				{error &&
					standardPosts.length === 0 &&
					pinnedPosts.length === 0 && (
						<div className="w-full sm:max-w-lg">
							<PostStatus
								loading={false}
								error={error}
								empty={false}
								expired={false}
							/>
						</div>
					)}
				{/* Empty State (only when truly empty and not loading/erroring) */}
				{empty &&
					!loading &&
					!error &&
					standardPosts.length === 0 &&
					pinnedPosts.length === 0 && (
						<div className="w-full sm:max-w-lg">
							<PostStatus
								loading={false}
								error={null}
								empty={true}
								expired={false}
							/>
						</div>
					)}
				{/* Pinned Posts */}
				{pinnedPosts.map((post) => (
					<div
						key={`pinned-${post.id}`}
						className="flex w-full sm:max-w-lg"
					>
						{" "}
						{/* Added prefix to key */}
						<PostComponent
							post={post}
							handleUpvote={handleUpvote}
							handleDownvote={handleDownvote}
							onTagClick={handleTagClick}
							selectedTag={selectedTag}
						/>
					</div>
				))}
				{/* Standard/Filtered Posts List */}
				{postsToRender.map((post, index) => {
					// Attach the ref to the *second to last* post for earlier trigger, or adjust threshold
					const isTriggerElement =
						postsToRender.length >= 5 &&
						index === postsToRender.length - 3; // Example: trigger on 3rd last item if list is long enough
					// Fallback to last element if list is short
					const isLastElement = index === postsToRender.length - 1;

					return (
						<div
							key={post.id}
							className="flex w-full sm:max-w-lg"
							ref={
								isTriggerElement ||
								(postsToRender.length < 5 && isLastElement)
									? lastPostElementRef
									: null
							} // Attach ref strategically
						>
							<PostComponent
								post={post}
								handleUpvote={handleUpvote}
								handleDownvote={handleDownvote}
								onTagClick={handleTagClick}
								selectedTag={selectedTag}
							/>
						</div>
					);
				})}
				{/* Loading More Indicator */}
				{loadingMore && (
					<PostStatus
						error={null}
						loading={loadingMore}
						empty={false}
						expired={false}
					/>
				)}
				{/* Load More Error State */}
				{loadMoreError && !loadingMore && (
					<div className="flex justify-center items-center text-center text-sm text-text my-10">
						<div className="flex flex-col gap-2">
							<p>Oops! Something went wrong</p>
							<p
								onClick={() => fetchMorePosts(true)} // Explicitly call as retry on button click
								className="underline cursor-pointer hover:opacity-80"
							>
								Retry?
							</p>
						</div>
					</div>
				)}
				{/* End of List Indicator */}
				{!hasMore &&
					!loadingMore &&
					!loading &&
					!error &&
					!empty &&
					(pinnedPosts.length > 0 || standardPosts.length > 0) && ( // Show if not loading/erroring, not empty, and no more pages
						<PostFooter postFormRef={postFormRef} />
					)}
			</main>
		</div>
	);
}
