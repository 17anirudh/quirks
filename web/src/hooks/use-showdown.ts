import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const WS_URL = BACKEND_URL.replace(/^http/, 'ws');

export const useShowdown = (showdownId: string | null) => {
    const { qid } = useAuth();
    const [state, setState] = useState<'idle' | 'waiting' | 'success' | 'failure'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [partnerJoined, setPartnerJoined] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState<{ qIndex: number; answer: number } | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!showdownId || !qid) return;

        const url = `${WS_URL}/showdown/ws/${showdownId}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setState('waiting');
            // Announce presence to the room immediately after opening
            ws.send(JSON.stringify({ type: 'join', qid }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    // 'waiting' is the server ack that our WS connection is alive — no action needed
                    case 'waiting':
                        break;

                    // Only trust 'partner-joined' (carries qid) to set partnerJoined flag.
                    // This prevents a stranger connecting to the same roomId from triggering it.
                    case 'partner-joined':
                        if (data.qid && data.qid !== qid) {
                            setPartnerJoined(true);
                        }
                        break;

                    case 'partner-quit':
                        if (data.qid && data.qid !== qid) {
                            toast.error("Partner left the showdown");
                            setState('idle');
                            setPartnerJoined(false);
                        }
                        break;

                    case 'answer-synced':
                        if (data.qid !== qid) {
                            setPartnerTyping({ qIndex: data.qIndex, answer: data.answer });
                        }
                        break;

                    case 'showdown-success':
                        setState('success');
                        break;

                    case 'showdown-failure':
                        setError(data.message);
                        setState('failure');
                        toast.error(data.message ?? 'Wrong answers — try again');
                        break;

                    case 'error':
                        setError(data.message);
                        break;
                }
            } catch (err) {
                console.error('WS parse error', err);
            }
        };

        ws.onclose = () => {
            setPartnerJoined(false);
            wsRef.current = null;
        };

        return () => ws.close();
    }, [showdownId, qid]);

    const syncAnswer = useCallback((qIndex: number, answer: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'sync-answer', qIndex, answer, qid }));
        }
    }, [qid]);

    const quit = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'quit', qid }));
            wsRef.current.close();
        }
    }, [qid]);

    const validate = useCallback((a1: number, a2: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'validate-showdown', a1, a2 }));
        }
    }, []);

    return {
        state,
        error,
        partnerJoined,
        partnerTyping,
        syncAnswer,
        validate,
        quit,
        // resetState does NOT fire sideCannons — the success path in home.tsx does that explicitly
        resetState: () => {
            setState('idle');
            setError(null);
            setPartnerJoined(false);
            setPartnerTyping(null);
        }
    };
};
