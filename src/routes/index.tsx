import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='flex flex-col justify-center items-center'>
      <h1>hello</h1>
    </div>
  )
}
