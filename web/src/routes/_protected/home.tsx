import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useGlobalTimer } from '@/context/time-provider'
import { useShowdown } from '@/context/use-showdown'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/lib/components/ui/dialog'
import { toast } from 'sonner'
import { sideCannons } from '@/components/fireworks'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Keys } from '@/context/keys'
import { createShowdown, queryShowdownInvites } from '@/api/api'

export const Route = createFileRoute('/_protected/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { qid } = useAuth()
  const { isBlocked, startUnlockCooldown } = useGlobalTimer()
  const [showdownId, setShowdownId] = useState<string | null>(null)
  const [inviteQid, setInviteQid] = useState('')
  const [pendingInvite, setPendingInvite] = useState<any>(null)
  const [ignoredInvites] = useState(new Set<string>())
  const { state, partnerJoined, partnerTyping, syncAnswer, validate, quit, resetState } = useShowdown(showdownId)
  const [myAnswer, setMyAnswer] = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState('')
  const [quizData, setQuizData] = useState<any>(null)

  const { isPending: isLoadingFriends, data: friendsData, mutate: loadFriends } = useMutation({
    mutationKey: ['my-friends'],
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/friends/${qid}`)
      if (!res.ok) throw new Error("Failed to fetch friends")
      return res.json()
    },
    onError: () => toast.error("Failed to load friends")
  })

  const { data: invites } = useQuery({
    queryKey: Keys.showdownInvites(qid!),
    queryFn: async () => queryShowdownInvites(qid!),
    enabled: !!qid && !showdownId && !pendingInvite && state === 'idle',
    refetchInterval: 10_000,
  })

  // Handle new invites from the poll
  useEffect(() => {
    if (invites && invites.length > 0) {
      const invite = invites[0]
      if (!ignoredInvites.has(invite.id)) {
        setPendingInvite(invite)
      }
    }
  }, [invites, ignoredInvites])

  // 3. Start a new showdown
  const createShowdownMutation = useMutation({
    mutationFn: async (targetQid: string) => createShowdown(targetQid, qid!),
    onSuccess: (data) => {
      setQuizData(data)
      setShowdownId(data.id)
    },
    onError: () => toast.error("Check is user exists")
  })

  // 4. Abandon showdown
  const abandonShowdownMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/abandon/${id}`, { method: 'POST' })
    }
  })

  const handleStartShowdown = () => {
    if (!inviteQid) return toast.error("Enter QID")
    if (inviteQid === qid) return toast.error("Cannot challenge yourself")
    createShowdownMutation.mutate(inviteQid)
  }

  // --- Handlers & Effects ---

  useEffect(() => {
    if (partnerTyping) {
      setPartnerAnswer(partnerTyping.answer.toString())
    }
  }, [partnerTyping])

  const handleAcceptInvite = () => {
    if (!pendingInvite) return
    setQuizData(pendingInvite)
    setShowdownId(pendingInvite.id)
    setPendingInvite(null)
  }

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      if (state !== 'success' && state !== 'idle') {
        if (window.confirm("Quit Showdown? Session will end for both.")) {
          quit()
          if (showdownId) abandonShowdownMutation.mutate(showdownId)

          setShowdownId(null)
          setQuizData(null)
          setMyAnswer('')
          setPartnerAnswer('')
          resetState()
        }
      } else {
        setShowdownId(null)
        setQuizData(null)
        setMyAnswer('')
        setPartnerAnswer('')
        resetState()
      }
    }
  }

  useEffect(() => {
    if (state === 'success') {
      sideCannons()
      toast.success("Success! Feed unlocked for 2 mins")
      if (isBlocked) startUnlockCooldown(2)

      setTimeout(() => {
        setShowdownId(null)
        setQuizData(null)
        setMyAnswer('')
        setPartnerAnswer('')
        resetState()
        navigate({ to: '/posts/home' })
      }, 2000)
    }
  }, [state, navigate, resetState, startUnlockCooldown, isBlocked])

  const isCreator = quizData?.creater_qid === qid
  const myQuestion = isCreator ? quizData?.q1 : quizData?.q2
  const partnerQuestion = isCreator ? quizData?.q2 : quizData?.q1

  const handleValidate = () => {
    const creatorAns = isCreator ? Number(myAnswer) : Number(partnerAnswer)
    const joinerAns = isCreator ? Number(partnerAnswer) : Number(myAnswer)
    validate(creatorAns, joinerAns)
  }

  const canValidate = myAnswer.trim() !== '' && !isNaN(Number(myAnswer))

  return (
    <div className='p-8 space-y-8 max-w-xl mx-auto'>
      {isBlocked ? (
        <div className='border p-4 rounded-xl space-y-4 shadow-sm bg-card'>
          <p className='text-sm text-muted-foreground'>Invite a friend to unlock your feed by solving puzzles together.</p>
          <div className='flex gap-2'>
            <Input
              placeholder='Friend QID'
              value={inviteQid}
              onChange={e => setInviteQid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartShowdown()}
            />
            <Button onClick={handleStartShowdown} disabled={createShowdownMutation.isPending}>
              {createShowdownMutation.isPending ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
        </div>
      ) : (
        <div className='max-w-xl mx-auto'>
          <h1 className='text-2xl font-bold font-heading'>Hello there <span className='hover:scale-105 transition-all duration-300 cursor-pointer text-primary'>{qid}</span></h1>
          <p className='text-muted-foreground mb-6'>Try texting your friends :D</p>

          <div className='space-y-4'>
            <Button onClick={() => loadFriends()} disabled={isLoadingFriends}>
              {isLoadingFriends ? 'Loading...' : 'Show Friends'}
            </Button>

            <div className='flex gap-3 flex-wrap'>
              {friendsData?.friends && friendsData.friends.length > 0 ? (
                friendsData.friends.map((friend: any) => (
                  <Link
                    to='/u/$qid'
                    params={{ qid: friend.qid }}
                    key={friend.qid}
                    className='group border p-4 rounded-2xl shadow-sm bg-card flex flex-col items-center gap-2 hover:border-primary/50 transition-colors duration-200'
                  >
                    <div className='relative'>
                      <img
                        src={friend.pfp ?? "/pfp.webp"}
                        alt={friend.qid}
                        className='w-14 h-14 rounded-full object-cover border-2 border-background shadow-md group-hover:scale-105 transition-transform duration-200'
                      />
                      <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background' />
                    </div>
                    <p className='font-bold text-sm'>{friend.qid}</p>
                  </Link>
                ))
              ) : !isLoadingFriends && friendsData ? (
                <p className='text-sm text-muted-foreground'>No friends found yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Incoming Invite Card */}
      {pendingInvite && pendingInvite.creater_qid !== qid && (
        <div className='border-2 border-primary/50 p-6 rounded-2xl bg-primary/5 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <div className='space-y-1'>
            <p className='font-bold text-lg'>Invite from {pendingInvite.creater_qid}</p>
            <p className='text-xs text-muted-foreground'>Solve puzzles together to unlock the feed.</p>
          </div>
          <div className='flex gap-3'>
            <Button size='sm' onClick={handleAcceptInvite}>Accept</Button>
            <Button size='sm' variant='outline' onClick={() => {
              ignoredInvites.add(pendingInvite.id)
              setPendingInvite(null)
            }}>Decline</Button>
          </div>
        </div>
      )}

      <Dialog open={!!showdownId} onOpenChange={handleCloseDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-xl'>
              {state === 'success'
                ? '🎉 Feed Unlocked!'
                : partnerJoined
                  ? 'Showdown — Partner Ready'
                  : 'Showdown — Waiting for partner...'}
            </DialogTitle>
          </DialogHeader>

          {quizData ? (
            <div className='relative space-y-5 py-4'>
              {!partnerJoined && state !== 'success' && (
                <div className='absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm gap-3'>
                  <div className='h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin' />
                  <p className='text-sm font-semibold'>Waiting for partner to join…</p>
                  <p className='text-xs text-muted-foreground px-6 text-center italic'>Share your QID with them to get started</p>
                </div>
              )}

              <div className='space-y-3 p-4 border rounded-2xl bg-muted/30'>
                <p className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>Your Question</p>
                <p className='text-2xl font-mono text-center py-2'>{myQuestion}</p>
                <Input
                  type='number'
                  placeholder='Your answer'
                  value={myAnswer}
                  onChange={e => {
                    setMyAnswer(e.target.value)
                    syncAnswer(isCreator ? 1 : 2, Number(e.target.value))
                  }}
                  disabled={!partnerJoined || state === 'success'}
                  className='text-center text-lg h-12 rounded-xl focus-visible:ring-primary'
                />
              </div>

              <div className='space-y-3 p-4 border rounded-2xl bg-muted/10 opacity-80'>
                <p className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>Partner Question</p>
                <p className='text-2xl font-mono text-center py-2'>{partnerQuestion}</p>
                <Input
                  type='number'
                  placeholder='Waiting for partner…'
                  value={partnerAnswer}
                  readOnly
                  className="bg-muted text-center text-lg h-12 rounded-xl cursor-default"
                />
              </div>

              {state === 'failure' && (
                <p className='text-sm text-destructive font-semibold text-center animate-bounce'>Wrong answers — check your math and try again.</p>
              )}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className='h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin' />
              <p className='text-muted-foreground font-medium'>Initializing quiz...</p>
            </div>
          )}

          <DialogFooter>
            <Button
              className='w-full py-6 text-lg font-bold rounded-xl'
              disabled={!partnerJoined || !canValidate || state === 'success'}
              onClick={handleValidate}
            >
              {state === 'success' ? 'Unlocked!' : 'Validate Showdown'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}