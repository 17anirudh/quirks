import { createFileRoute } from '@tanstack/react-router'
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
  DialogDescription,
  DialogFooter
} from '@/lib/components/ui/dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = useAuth()
  const { isBlocked, startUnlockCooldown } = useGlobalTimer()

  const [showdownId, setShowdownId] = useState<string | null>(null)
  const [inviteQid, setInviteQid] = useState('')
  const [pendingInvite, setPendingInvite] = useState<any>(null)
  const [ignoredInvites] = useState(new Set<string>())

  const { state, error, partnerJoined, partnerTyping, syncAnswer, validate, resetState } = useShowdown(showdownId)

  const [myAnswer, setMyAnswer] = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState('')
  const [quizData, setQuizData] = useState<any>(null)

  // Polling for invites
  useEffect(() => {
    if (!qid || showdownId || pendingInvite) return

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

    const interval = setInterval(checkInvites, 5000)
    return () => clearInterval(interval)
  }, [qid, showdownId, pendingInvite, ignoredInvites])

  // Sync partner typing to the local partnerAnswer field
  useEffect(() => {
    if (partnerTyping) {
      setPartnerAnswer(partnerTyping.answer.toString())
    }
  }, [partnerTyping])

  const handleStartShowdown = async () => {
    if (!inviteQid) return toast.error("Enter QID")
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
      toast.success("Success! Feed unlocked for 2 mins")
      startUnlockCooldown(2)
      setShowdownId(null)
      setQuizData(null)
      resetState()
    }
  }, [state])

  const isCreator = quizData?.creater_qid === qid
  const myQuestion = isCreator ? quizData?.q1 : quizData?.q2
  const partnerQuestion = isCreator ? quizData?.q2 : quizData?.q1

  return (
    <div className='p-8 space-y-8 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold'>Showdown Initiation</h1>

      <div className='border p-4 rounded-xl space-y-4'>
        <p className='text-sm text-muted-foreground'>Invite others to unlock your feed (if blocked in posts).</p>
        <div className='flex gap-2'>
          <Input
            placeholder='Friend QID'
            value={inviteQid}
            onChange={e => setInviteQid(e.target.value)}
          />
          <Button onClick={handleStartShowdown}>Invite</Button>
        </div>
      </div>

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
          if (state !== 'success' && window.confirm("Quit?")) {
            setShowdownId(null);
            resetState();
            if (showdownId) fetch(`${import.meta.env.VITE_BACKEND_URL}/showdown/abandon/${showdownId}`, { method: 'POST' });
          } else if (state === 'success') {
            setShowdownId(null);
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Showdown: {partnerJoined ? "Partner Joined" : "Waiting..."}</DialogTitle>
          </DialogHeader>

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
                placeholder='Wait for partner or fill manually'
                value={partnerAnswer}
                onChange={e => setPartnerAnswer(e.target.value)}
              />
              <p className='text-[10px]'>Question: {partnerQuestion}</p>
            </div>
          </div>

          <DialogFooter>
            <Button className='w-full' onClick={() => validate(
              isCreator ? Number(myAnswer) : Number(partnerAnswer),
              isCreator ? Number(partnerAnswer) : Number(myAnswer)
            )}>Validate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
