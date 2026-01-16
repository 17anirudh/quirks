import { AlertTriangle, HomeIcon, RotateCcwIcon } from "lucide-react"
import { type ErrorComponentProps, Link } from "@tanstack/react-router"
import { Button } from "@/lib/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
} from "@/lib/components/ui/empty"

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
    return (
        <Empty className="from-muted/50 to-background bg-neutral-950 min-h-dvh w-screen from-30% -z-10 flex flex-col items-center justify-center p-6">
            <EmptyHeader className="flex flex-col items-center gap-2 mb-6">
                <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <EmptyTitle className="text-xl font-semibold text-white">Something went wrong</EmptyTitle>
                <EmptyDescription className="text-neutral-400 max-w-md text-center text-wrap break-words">
                    {error.message || "An unexpected error occurred. Please try again."}
                </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex flex-col items-center gap-6 w-full max-w-lg">
                <div className="flex gap-3">
                    <Button onClick={() => reset()} variant="secondary" className="gap-2">
                        <RotateCcwIcon className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" className="gap-2 bg-transparent border-white/10 hover:bg-white/5 text-neutral-300">
                        <Link to="/">
                            <HomeIcon className="h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>

                {error.stack && (
                    <details className="w-full group">
                        <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs text-neutral-500 hover:text-neutral-300 transition-colors list-none select-none p-2">
                            <span>Show Technical Details</span>
                        </summary>
                        <div className="mt-2 p-4 rounded-lg bg-black/50 border border-white/10 font-mono text-xs overflow-auto max-h-[300px] w-full text-left">
                            <div className="mb-2 flex gap-2">
                                <span className="text-neutral-500">Error:</span>
                                <span className="text-red-400">{error.name}</span>
                            </div>
                            <pre className="text-neutral-400 whitespace-pre-wrap break-all">
                                {error.stack}
                            </pre>
                        </div>
                    </details>
                )}
            </EmptyContent>
        </Empty>
    )
}
