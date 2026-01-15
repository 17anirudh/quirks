import { BanIcon, RotateCcwIcon } from "lucide-react"
import { type ErrorComponentProps } from "@tanstack/react-router"
import { Button } from "@/lib/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
} from "@/lib/components/ui/empty"

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
    return (
    <Empty className="from-muted/50 to-background bg-black min-h-dvh w-screen from-30% -z-10">
        <EmptyHeader>
            <BanIcon className="bg-transparent animate-pulse" color="red" />
            <p className="text-red-700">ERROR!!!</p>
        </EmptyHeader>
        <EmptyContent className="mt-5 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
                <h2>Name: </h2>
                <pre className="text-red-500 text-wrap">{error.name}</pre>
            </div>
            <div className="flex gap-5 flex-wrap w-full">
                <h2>Message: </h2>
                <pre className="text-red-500 text-wrap">{error.message}</pre>
            </div>
            <div className="flex gap-5 flex-wrap w-full">
                <h2>Cause: </h2>
                <pre className="text-red-500 text-wrap">{JSON.stringify(error.cause, null, 2)}</pre>
            </div>
            <div className="flex gap-5 flex-wrap w-full">
                <h2>Stack</h2>
                <pre className="text-red-500 text-wrap">{error.stack}</pre>
            </div>
            <Button onClick={() => reset()} className="cursor-pointer" variant='destructive'>
                <RotateCcwIcon />
                Retry
            </Button>
        </EmptyContent>
    </Empty>
  )
}