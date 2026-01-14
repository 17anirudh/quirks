import { HouseIcon, BanIcon } from "lucide-react"
import { useParams, useLocation, Link } from "@tanstack/react-router"
import { Button } from "@/lib/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/lib/components/ui/empty"

export function NotFound() {
  const location = useLocation()
      const params = useParams({ strict: false })
    
    // Get the attempted path
    const attemptedPath = location.pathname
    return (
    <Empty className="from-muted/50 to-background bg-black h-dvh w-screen from-30% -z-10">
      <EmptyHeader>
        <BanIcon className="bg-transparent animate-pulse" color="red" />
        <EmptyTitle className="text-white flex gap-3"><pre className="text-red-500">{attemptedPath}</pre> does not exist</EmptyTitle>
        <EmptyContent className="mt-5">
        <Button variant="outline" size="sm" asChild className="hover:bg-transparent">
          <Link to='/' ><HouseIcon />Go back to Home</Link>
        </Button>
      </EmptyContent>
        <EmptyDescription>
          {params && Object.keys(params).length > 0 && (
          <div className="mt-6 bg-gray-700 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-300 mb-2">Route Parameters:</p>
            <pre className="text-xs text-left text-white">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        )}
        </EmptyDescription>
      </EmptyHeader>
      
    </Empty>
  )
}