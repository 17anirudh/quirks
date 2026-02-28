import { createFileRoute } from '@tanstack/react-router'
import { useGlobalTimer } from '@/hooks/time-provider';
import { Button } from '@/lib/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PostCard from '@/components/post-card';
import Loader from '@/components/loader';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '@/hooks/auth-provider';

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isBlocked, resetTimer } = useGlobalTimer();
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

  return (
    <div className="p-4 relative h-full flex flex-col items-center overflow-hidden">
      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md">
          <div className="p-6 border-2 bg-card text-center rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Cooldown Active</h2>
            <Button
              onClick={resetTimer}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Reset Timer
            </Button>
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