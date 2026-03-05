import { createFileRoute, Link } from '@tanstack/react-router'
import { useGlobalTimer } from '@/context/time-provider';
import { Button } from '@/lib/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PostCard from '@/components/post-card';
import Loader from '@/components/loader';
import { Loader2Icon, PyramidIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RouteComponent() {
  const { isBlocked, unlockRemaining } = useGlobalTimer();
  const { qid } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['feed', qid],
    queryFn: async ({ pageParam = null }) => {
      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/post/feed/${qid}`);
      url.searchParams.append('limit', '30');
      if (pageParam) {
        url.searchParams.append('cursor', pageParam);
      }

      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch feed');
      }

      return res.json() as Promise<{
        items: any[];
        nextCursor: string | null;
      }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!qid,
  });

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  // Unlocked by showdown — ticking countdown pill
  const isUnlocked = !isBlocked && unlockRemaining > 0;

  return (
    <div className="p-4 relative h-full flex flex-col items-center overflow-hidden">

      {/* Feed locked overlay */}
      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-6 text-center">
          <div className="p-8 border-2 bg-card rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
            <div className="flex flex-col items-center gap-3">
              <img src='/bhAAi.webp' width={100} height={100} />
              <h2 className="text-2xl font-bold tracking-tight">Feed Locked</h2>
              <p className="text-muted-foreground text-sm">Oops too much watch time. Enter a Showdown to unlock.</p>
              <p className="text-muted-foreground text-sm">Don't worry, rest of the app, works :D</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="w-full bg-primary py-6 text-lg font-semibold"
              >
                <Link to="/home"><PyramidIcon />Enter Showdown</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked countdown pill — sticky top bar */}
      {isUnlocked && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md p-6 text-center">
          <div className="p-8 border-2 bg-card rounded-2xl shadow-2xl max-w-sm w-full space-y-6 flex flex-col items-center">
            <img src='/drink.gif' width={100} height={100} />
            <p className="text-sm font-medium flex-1">Hydrate and breath, your feed will unlock in</p>
            <p className="font-mono text-2xl font-semibold tracking-tight text-white">{formatTime(unlockRemaining)}</p>
          </div>
        </div>
      )}

      <div className={`w-full max-w-2xl flex-1 flex flex-col overflow-hidden ${isBlocked ? "blur-sm pointer-events-none" : ""}`}>
        {status === 'pending' ? (
          <div className="flex justify-center p-8">
            <Loader />
          </div>
        ) : status === 'error' ? (
          <div className="text-center text-red-500 p-8">Error loading feed</div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={allPosts}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            itemContent={(_, post) => (
              <div className="flex justify-center w-full">
                <PostCard post={post} />
              </div>
            )}
            components={{
              Footer: () => (
                <div className="flex justify-center p-4">
                  {isFetchingNextPage ? (
                    <Loader2Icon className="animate-spin w-8 h-8 text-neutral-500" />
                  ) : hasNextPage ? (
                    <span className="text-sm text-neutral-500">Scroll for more</span>
                  ) : (
                    <span className="text-sm text-neutral-500">You've reached the end!</span>
                  )}
                </div>
              )
            }}
          />
        )}
      </div>
    </div>
  );
}