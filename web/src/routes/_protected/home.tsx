import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/auth-provider'
import { useGlobalTimer } from '@/hooks/time-provider'
import { useShowdown } from '@/hooks/use-showdown'
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
import { sideCannons } from '@/components/side-cannons'
import { useMutation } from '@tanstack/react-query'

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

  const { isPending: isLoading, data: friends, mutate: loadFriends } = useMutation({
    mutationKey: ['my-friends'],
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/friends/${qid}`)
      if (!res.ok) throw new Error("Fail")
      const data = await res.json()
      return data
    },
    onSuccess: () => {
      toast.success("Friends loaded")

    },
    onError: () => {
      toast.error("Failed to load friends")
    }
  })

  const checkInvites = useCallback(async () => {
    if (!qid || showdownId || pendingInvite || state !== 'idle') return
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/invites/${qid}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          const invite = data[0]
          if (!ignoredInvites.has(invite.id)) {
            setPendingInvite(invite)
          }
        }
      }
    } catch (e) {
      console.error("Invite check fail", e)
    }
  }, [qid, showdownId, pendingInvite, ignoredInvites, state])

  useEffect(() => {
    checkInvites()
    const interval = setInterval(checkInvites, 10_000)
    return () => clearInterval(interval)
  }, [checkInvites])

  useEffect(() => {
    if (partnerTyping) {
      setPartnerAnswer(partnerTyping.answer.toString())
    }
  }, [partnerTyping])

  const handleStartShowdown = async () => {
    if (!inviteQid) return toast.error("Enter QID")
    if (inviteQid === qid) return toast.error("Cannot challenge yourself")

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creater_qid: qid, joiner_qid: inviteQid })
      })
      if (!res.ok) throw new Error("Fail")
      const data = await res.json()
      setQuizData(data)
      setShowdownId(data.id)
    } catch (err: any) {
      toast.error("Error starting showdown")
    }
  }

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
          if (showdownId) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/abandon/${showdownId}`, { method: 'POST' })
          }
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

  // Handle success state
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
  }, [state, navigate, resetState, startUnlockCooldown])

  const isCreator = quizData?.creater_qid === qid
  const myQuestion = isCreator ? quizData?.q1 : quizData?.q2
  const partnerQuestion = isCreator ? quizData?.q2 : quizData?.q1

  // Validate sends: a1 = creator's answer, a2 = joiner's answer (matches server schema)
  const handleValidate = () => {
    const creatorAns = isCreator ? Number(myAnswer) : Number(partnerAnswer)
    const joinerAns = isCreator ? Number(partnerAnswer) : Number(myAnswer)
    validate(creatorAns, joinerAns)
  }

  // Allow submit if the user has typed their own answer.
  // Partner answer sync is bonus — the server validates from the DB, not from the client.
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
            <Button onClick={handleStartShowdown}>Invite</Button>
          </div>
        </div>
      ) : (
        <div className='max-w-xl mx-auto'>
          <h1 className='text-2xl font-bold'>Hello there <span className='hover:scale-105 transition-all duration-300 cursor-pointer'>{qid}</span></h1>
          <p>Try texting your friends :D</p>
          <Button onClick={() => loadFriends()}>Friends</Button>
          <div className='flex gap-2 flex-wrap'>
            {isLoading ? (
              <p>Loading friends...</p>
            ) : (
              friends?.friends.map((friend: any) => (
                <Link to='/u/$qid' params={{ qid: friend.qid }} key={friend.qid} className='border p-4 rounded-xl space-y-4 shadow-sm bg-card flex flex-col items-center'>
                  <img src={friend.pfp ?? "/pfp.webp"} alt={friend.pfp ?? "pfp"} className='w-12 h-12 rounded-full' />
                  <p className='font-bold'>{friend.qid}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Only show incoming invites — never show the user's own outgoing invite */}
      {pendingInvite && pendingInvite.creater_qid !== qid && (
        <div className='border-2 border-primary p-4 rounded-xl bg-primary/5 flex justify-between items-center'>
          <div>
            <p className='font-bold'>Invite from {pendingInvite.creater_qid}</p>
            <p className='text-xs'>Solve puzzles together to unlock the feed.</p>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' onClick={handleAcceptInvite}>Accept</Button>
            <Button size='sm' variant='outline' onClick={() => {
              ignoredInvites.add(pendingInvite.id)
              setPendingInvite(null)
            }}>Decline</Button>
          </div>
        </div>
      )}

      <Dialog open={!!showdownId} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {state === 'success'
                ? '🎉 Feed Unlocked!'
                : partnerJoined
                  ? 'Showdown — Partner Ready'
                  : 'Showdown — Waiting for partner...'}
            </DialogTitle>
          </DialogHeader>

          {quizData ? (
            <div className='relative space-y-4 py-4'>
              {/* Waiting overlay — blocks the quiz until partner connects */}
              {!partnerJoined && state !== 'success' && (
                <div className='absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm gap-2'>
                  <div className='h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                  <p className='text-sm font-medium'>Waiting for partner to join…</p>
                  <p className='text-xs text-muted-foreground'>Share your QID with them to get started</p>
                </div>
              )}

              <div className='space-y-2 border p-3 rounded'>
                <p className='font-bold text-sm'>Your Question</p>
                <p className='text-xl font-mono'>{myQuestion}</p>
                <Input
                  type='number'
                  placeholder='Your answer'
                  value={myAnswer}
                  onChange={e => {
                    setMyAnswer(e.target.value)
                    syncAnswer(isCreator ? 1 : 2, Number(e.target.value))
                  }}
                  disabled={!partnerJoined || state === 'success'}
                />
              </div>

              <div className='space-y-2 border p-3 rounded opacity-75'>
                <p className='font-bold text-sm'>Partner&apos;s Question</p>
                <p className='text-xl font-mono'>{partnerQuestion}</p>
                <Input
                  type='number'
                  placeholder='Waiting for partner to type…'
                  value={partnerAnswer}
                  readOnly
                  className="bg-muted cursor-default"
                />
              </div>

              {state === 'failure' && (
                <p className='text-sm text-destructive text-center'>Wrong answers — check your math and try again.</p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Initializing quiz...</div>
          )}

          <DialogFooter>
            <Button
              className='w-full'
              disabled={!partnerJoined || !canValidate || state === 'success'}
              onClick={handleValidate}
            >
              Validate Showdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
