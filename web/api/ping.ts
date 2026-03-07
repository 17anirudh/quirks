export default async function GET(request: Request): Promise<Response> {
    const url = `${import.meta.env.VITE_BACKEND_URL}/awake/`
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return new Response("Called backend");
}