import { createFileRoute } from '@tanstack/react-router'
import { useGlobalTimer } from '@/hooks/time-provider';
import { Button } from '@/lib/components/ui/button';

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isBlocked, resetTimer } = useGlobalTimer();

  return (
    <div className="p-4 relative min-h-full">
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

      <div className={isBlocked ? "blur-sm pointer-events-none" : ""}>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="h-64 mb-4">
            <p>Post {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}