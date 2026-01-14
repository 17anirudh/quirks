import { createFileRoute } from '@tanstack/react-router'
import { Scroller } from '@/lib/components/ui/scroller'

export const Route = createFileRoute('/_protected/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Scroller className='flex flex-col justify-center items-center'>
        <h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1><h1>hello</h1>
    </Scroller>
  )
}
