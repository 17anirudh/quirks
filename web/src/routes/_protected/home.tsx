import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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

  // Polling for invites
  useEffect(() => {
    // CRITICAL: Stop polling if we are already in a showdown or have a pending invite
    if (!qid || showdownId || pendingInvite || state !== 'idle') return

    const checkInvites = async () => {
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
    }

    const interval = setInterval(checkInvites, 8000)
    return () => clearInterval(interval)
  }, [qid, showdownId, pendingInvite, ignoredInvites, state])

  // Sync partner typing to the local partnerAnswer field
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

  useEffect(() => {
    if (state === 'success') {
      sideCannons()
      toast.success("Success! Feed unlocked for 2 mins")
      startUnlockCooldown(2)

      setTimeout(() => {
        setShowdownId(null)
        setQuizData(null)
        resetState()
        navigate({ to: '/posts/home' })
      }, 2000)
    }
  }, [state, navigate, resetState, startUnlockCooldown])

  // Removed aggressive reset effect to prevent race condition

  const isCreator = quizData?.creater_qid === qid
  const myQuestion = isCreator ? quizData?.q1 : quizData?.q2
  const partnerQuestion = isCreator ? quizData?.q2 : quizData?.q1

  return (
    <div className='p-8 space-y-8 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold'>Showdown Initiation</h1>

      {isBlocked ? (
        <div className='border p-4 rounded-xl space-y-4 shadow-sm bg-card'>
          <p className='text-sm text-muted-foreground'>Invite a friend to unlock your feed by solving puzzles together.</p>
          <div className='flex gap-2'>
            <Input
              placeholder='Friend QID'
              value={inviteQid}
              onChange={e => setInviteQid(e.target.value)}
            />
            <Button onClick={handleStartShowdown}>Invite</Button>
          </div>
        </div>
      ) : (
        <div className='border p-6 rounded-xl bg-muted/50 text-center space-y-2'>
          <p className='font-medium'>Your feed is active!</p>
          <p className='text-xs text-muted-foreground'>Showdown invites can only be sent when your feed is locked.</p>
        </div>
      )}

      {pendingInvite && (
        <div className='border-2 border-primary p-4 rounded-xl bg-primary/5 flex justify-between items-center'>
          <div>
            <p className='font-bold'>Invite from {pendingInvite.creater_qid}</p>
            <p className='text-xs'>Solve puzzles to unlock feed.</p>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' onClick={handleAcceptInvite}>Accept</Button>
            <Button size='sm' variant='outline' onClick={() => {
              ignoredInvites.add(pendingInvite.id);
              setPendingInvite(null);
            }}>Decline</Button>
          </div>
        </div>
      )}

      <Dialog open={!!showdownId} onOpenChange={open => {
        if (!open) {
          if (state !== 'success' && state !== 'idle') {
            if (window.confirm("Quit Showdown? Session will end for both.")) {
              quit()
              if (showdownId) fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/abandon/${showdownId}`, { method: 'POST' });
              setShowdownId(null);
              setQuizData(null);
              resetState();
            }
          } else {
            setShowdownId(null);
            setQuizData(null);
            resetState();
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Showdown: {partnerJoined ? "Partner Joined" : "Waiting for partner..."}</DialogTitle>
          </DialogHeader>

          {quizData ? (
            <div className='space-y-4 py-4'>
              <div className='space-y-2 border p-3 rounded'>
                <p className='font-bold'>Your Question: {myQuestion}</p>
                <Input
                  type='number'
                  placeholder='Your Answer'
                  value={myAnswer}
                  onChange={e => {
                    setMyAnswer(e.target.value);
                    syncAnswer(isCreator ? 1 : 2, Number(e.target.value));
                  }}
                />
              </div>

              <div className='space-y-2 border p-3 rounded'>
                <p className='font-bold'>Partner Answer (Syncs automatically):</p>
                <Input
                  type='number'
                  placeholder='Wait for partner...'
                  value={partnerAnswer}
                  readOnly
                  className="bg-muted"
                />
                <p className='text-[10px]'>Question: {partnerQuestion}</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Initializing quiz...</div>
          )}

          <DialogFooter>
            <Button className='w-full' disabled={!myAnswer || !partnerAnswer} onClick={() => validate(
              isCreator ? Number(myAnswer) : Number(partnerAnswer),
              isCreator ? Number(partnerAnswer) : Number(myAnswer)
            )}>Validate Showdown</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
