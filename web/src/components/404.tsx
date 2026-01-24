import NotFound404 from "./ui/not-found"

export function NotFound() {
  return (
    <NotFound404
      particleCount={10000}
      particleSize={4}
      animate={true}
      buttonText="Go Back"
      buttonHref="/"
      className="custom-shadow"
    />
  )
}