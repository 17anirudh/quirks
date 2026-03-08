import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

export function NotFound() {
  return (
    <div className="bg-black h-screen w-screen text-white flex flex-col justify-center items-center">
      <Image src="/NotFound.gif" height={70} width={70} alt="Not found gif" />
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        404
      </h1>
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Page Not Found
      </h1>
      <Link to="/">
        Go Back
      </Link>
    </div>
  )
}