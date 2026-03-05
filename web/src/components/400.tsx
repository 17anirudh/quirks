import { BanIcon } from "lucide-react"
import { type ErrorComponentProps } from "@tanstack/react-router"

export function ErrorComponent({ error }: ErrorComponentProps) {
    return (
        <div>
            <h1>
                <BanIcon className="bg-transparent animate-pulse" color="red" />
                <span>ERROR</span>
            </h1>
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
        </div>
    )
}