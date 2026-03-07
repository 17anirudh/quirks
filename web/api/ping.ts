export default async function handler(req: any, res: any): Promise<void> {
    const url = `${import.meta.env.VITE_BACKEND_URL}/awake/`

    try {
        const r = await fetch(url)
        res.status(200).json({ ok: true, status: r.status })
    } catch (err) {
        res.status(500).json({ ok: false })
    }
}