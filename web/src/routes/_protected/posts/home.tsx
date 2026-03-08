import { createFileRoute, Link } from '@tanstack/react-router'
import { useGlobalTimer } from '@/context/time-provider';
import { Button } from '@/lib/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PostCard from '@/components/post-card';
import Loader from '@/components/loader';
import { PyramidIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { fetchFeed } from '@/api/api';
import { Image } from '@unpic/react';

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
  const isUnlocked = !isBlocked && unlockRemaining > 0;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['feed', qid],
    queryFn: async ({ pageParam = null }) => fetchFeed(pageParam, qid!),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!qid,
  });

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];


  return (
    <div className="p-4 relative h-full flex flex-col items-center overflow-hidden w-full">

      {/* Feed locked overlay */}
      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-6 text-center">
          <div className="p-8 border-2 bg-card rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
            <div className="flex flex-col items-center gap-3">
              <Image src='/bhAAi.webp' width={100} height={100} />
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
            <Image src='/drink.gif' width={100} height={100} />
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
            initialItemCount={5}
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
                    <Loader />
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