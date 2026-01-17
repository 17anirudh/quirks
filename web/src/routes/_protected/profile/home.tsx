import { createFileRoute, Link } from '@tanstack/react-router'
import Loader from '@/components/loader'

type res = {
  u_qid: string | null,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null
}


export const Route = createFileRoute('/_protected/profile/home')({
  loader: async ({ context }) => {
    const qid = context.auth.user?.user_metadata.u_qid
    return context.queryClient.ensureQueryData({
      queryKey: ['user', qid],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/search/${qid}`)
        return await res.json() as res
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useLoaderData() as res
  return (
    <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
      {/* Profile Card */}
      <div className='flex flex-col gap-5 p-5 border items-start w-11/12 h-full'>
        {/* qid */}
        <h2 id="id" className="text-center scroll-m-20 mb-5 pb-2 text-3xl font-semibold tracking-tight first:mt-0">{ctx ? `@${ctx.u_qid}` : ''}</h2>
        {/* image, posts, Friends */}
        <div className="flex flex-wrap gap-4 justify-center items-center sm:gap-9">
          <div className="w-28 h-28 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
            <img
              src={ctx.u_pfp ?? "/pfp.webp"}
              alt={ctx.u_qid ?? "profile picture"}
              className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="flex-col gap-5">
            <h3 className="capitalize scroll-m-20 text-2xl font-semibold tracking-tight">{ctx ? ctx.u_name : ''}</h3>
            <div className="flex flex-wrap gap-2">
              <h4 className="scroll-m-20 text-xl font-light tracking-tight">0</h4>
              <h4 className="scroll-m-20 text-xl font-light tracking-tight">Posts</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <h4 className="scroll-m-20 text-xl font-light tracking-tight">0</h4>
              <h4 className="scroll-m-20 text-xl font-light tracking-tight">Friends</h4>
            </div>
          </div>
        </div>
        <article className='w-full flex border-3'>
          <p className="min-w-0 break-words whitespace-normal overflow-hidden">
            {ctx.u_bio ? ctx.u_bio : 'csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh..csjdgfcudgcodfuohcvldhclidhciohefilhewlhdceioscusiefcwvdfvfdvrkdfhvcdjfhflrjhcflrejfcridsjcfrilcfjslefjcrleskfjciedsjclkdsjncklerh...'}
          </p>
        </article>
      </div>
      <Link to='/profile/settings' >Settings</Link>
    </div>
  )
}