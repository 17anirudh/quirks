import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { ConfettiFireworks } from '@/components/fireworks'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/lib/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/components/ui/dialog';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/lib/components/ui/field"
import { Input } from "@/lib/components/ui/input"
import { profileSchema } from '@/services/user';
import Loader from '@/components/loader'
import { CursorHighlight } from '@/components/ui/cursor-highlight'
import { ConstructionIcon } from '@/lib/components/ui/construction'
import Carousel from '@/components/ui/carousel'

// Schemas
const createAccountSchema = profileSchema.pick({
    u_qid: true,
    u_mail: true
}).extend({
    u_pass: z
        .string()
        .min(8, "Your password must atleast 8 characters")
        .max(300, "Your password must be atmost 300 characters")
})

const logInUserSchema = createAccountSchema.pick({
    u_mail: true,
    u_pass: true
})

const slideData: {
    title: string;
    src: string;
}[] = [
        {
            title: "Chats",
            src: "/gifs/chats.gif",
        },
        {
            title: "Posts",
            src: "/gifs/posts.gif",
        },
        {
            title: "Timer",
            src: "/gifs/timer.gif",
        }
    ]

export const Route = createFileRoute('/')({
    loader: async ({ context }) => {
        const session = await context.auth.waitForAuth()
        if (session) {
            throw redirect({ to: '/home', replace: true })
        }
    },
    pendingComponent: () => <Loader />,
    component: AppComponent,
})

function AppComponent() {
    const navigate = useNavigate()
    const client = Route.useRouteContext().queryClient
    const logInUser = useMutation({
        mutationFn: async (values: z.infer<typeof logInUserSchema>) => {
            const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signInWithPassword({
                email: values.u_mail,
                password: values.u_pass
            })
            if (!authData || authError) throw authError
            return authData
        },
        onMutate: () => (
            <Loader />
        ),
        onError: (err) => {
            toast.error(err.message + '😅')
            console.error(err.message)
        },
        onSuccess: (data) => {
            // Manual set query
            client.setQueryData(['auth'], data)
            toast.success("Welcome back 🦆🦆")
            navigate({ to: '/home', replace: true })
        }
    })
    const loginForm = useForm({
        defaultValues: {
            u_mail: '',
            u_pass: ''
        },
        validators: {
            onSubmit: logInUserSchema,
        },
        onSubmit: async ({ value }) => {
            logInUser.mutate(value)
        },
    })
    const createAccount = useMutation({
        mutationFn: async (values: z.infer<typeof createAccountSchema>) => {
            const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signUp({
                email: values.u_mail,
                password: values.u_pass,
                options: {
                    data: {
                        u_qid: values.u_qid
                    }
                }
            })
            if (!authData || authError) throw new Error("Failed to create account")
            if (!authData.session?.access_token) throw new Error("Failed to create account")
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/create`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${authData.session.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ u_qid: values.u_qid })
            })
            if (!res.ok) throw new Error("Failed to create account")
            return authData.session
        },
        onMutate: () => (
            <Loader />
        ),
        onError: (err) => {
            toast.error(err.message + '😅')
            throw new Error(err.message)
        },
        onSuccess: (session) => {
            client.setQueryData(['auth'], session)
            toast.success("Account created successfully 🦆🦆")
            navigate({ to: '/home', replace: true })
        }
    })
    const signUpForm = useForm({
        defaultValues: {
            u_qid: '',
            u_mail: '',
            u_pass: '',
        },
        validators: {
            onSubmit: createAccountSchema,
        },
        onSubmit: async ({ value }) => {
            createAccount.mutate(value)
        },
    })
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">
            <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-zinc-900">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <ConfettiFireworks>
                        <CursorHighlight
                            className="text-2xl sm:text-3xl md:text-4xl font-bold"
                            gradient="from-rose-500 via-fuchsia-500 to-rose-500"
                            showPointer={true}
                            pointerClassName="text-pink-500"
                            direction="bottom"
                            rectangle="bg-pink-100 dark:bg-slate-900 border-blue dark:border-white/20 rounded-lg p-4"
                        >
                            <h1>Quirks</h1>
                        </CursorHighlight>
                    </ConfettiFireworks>
                    <div className="flex gap-4">
                        <Link to='/credits' className='flex justify-center items-center font-semibold hover:underline'>Credits</Link>
                        {/* Login form */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='cursor-pointer'>Log in</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                        aria-hidden="true"
                                    >
                                        <img
                                            src="./duck.gif"
                                            alt="logo"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
                                        <DialogDescription className="sm:text-center">
                                            Welcome back, enter your credentials to log in.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className='flex flex-col justify-center items-center gap-9'>
                                    {/* login form */}
                                    <div className="w-full p-10">
                                        <form
                                            id="login-form"
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                loginForm.handleSubmit()
                                            }}
                                        >
                                            <FieldGroup>
                                                <loginForm.Field
                                                    name="u_mail"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Mail</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Enter your mail.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <loginForm.Field
                                                    name="u_pass"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                    type="password"
                                                                />
                                                                <FieldDescription>
                                                                    Enter your password.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <Field orientation="horizontal">
                                                    <Button
                                                        className="cursor-pointer"
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => loginForm.reset()}
                                                        disabled={logInUser.isPending} // Disable while loading
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        className="cursor-pointer"
                                                        type="submit"
                                                        form="login-form"
                                                        disabled={logInUser.isPending} // Disable while loading
                                                    >
                                                        {logInUser.isPending ? "Logining in..." : "Submit"}
                                                    </Button>
                                                </Field>
                                            </FieldGroup>
                                        </form>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {/* Signup Form */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className='cursor-pointer'>Sign up</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                        aria-hidden="true"
                                    >
                                        <img
                                            src="./duck.gif"
                                            alt="logo"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="sm:text-center">Create an Account</DialogTitle>
                                        <DialogDescription className="sm:text-center">
                                            Add your credentials to create your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className='flex flex-col justify-center items-center gap-9'>
                                    {/* Signup form */}
                                    <div className="w-full p-10">
                                        <form
                                            id="signup-form"
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                signUpForm.handleSubmit()
                                            }}
                                        >
                                            <FieldGroup>
                                                <signUpForm.Field
                                                    name="u_qid"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>QID</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Create your identity 😎.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                {/* <FieldSeparator /> */}
                                                <signUpForm.Field
                                                    name="u_mail"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Mail</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Enter your mail.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <signUpForm.Field
                                                    name="u_pass"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                    type="password"
                                                                />
                                                                <FieldDescription>
                                                                    Enter your password.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <signUpForm.Subscribe
                                                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                                                    children={([canSubmit, isSubmitting]) => (
                                                        <div className='flex gap-3'>
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                className='cursor-pointer'
                                                                disabled={!canSubmit || createAccount.isPending}
                                                            >
                                                                {isSubmitting ? '...' : 'Submit'}
                                                            </Button>
                                                            <Button
                                                                type="reset"
                                                                className='cursor-pointer'
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    signUpForm.reset()
                                                                }}
                                                            >
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                            </FieldGroup>
                                        </form>
                                    </div>
                                    {/* Error message */}
                                    {createAccount.isError && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                                            <pre>{JSON.stringify(createAccount.error, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </nav>

            <header className="relative w-screen h-[70vh] md:h-[600px] overflow-hidden border-zinc-800">
                <img
                    src="/landing/mindless crowd.avif"
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Crowd background"
                    loading='eager'
                />
                <div className="absolute inset-0 bg-zinc-950/40 z-10" />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Hero Content - Kept within a max-width container so text doesn't stretch too far */}
                <div className="relative z-30 h-full max-w-7xl mx-auto flex flex-col items-center justify-end pb-16 px-6 text-center gap-3">
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                        Opinionated Social Media Application
                    </h1>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Redefining what Social Media should be
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {/* Login form */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='cursor-pointer text-lg font-semibold' size="lg">Log in</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                        aria-hidden="true"
                                    >
                                        <img
                                            src="./duck.gif"
                                            alt="logo"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
                                        <DialogDescription className="sm:text-center">
                                            Welcome back, enter your credentials to log in.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className='flex flex-col justify-center items-center gap-9'>
                                    {/* login form */}
                                    <div className="w-full p-10">
                                        <form
                                            id="login-form"
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                loginForm.handleSubmit()
                                            }}
                                        >
                                            <FieldGroup>
                                                <loginForm.Field
                                                    name="u_mail"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Mail</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Enter your mail.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <loginForm.Field
                                                    name="u_pass"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                    type="password"
                                                                />
                                                                <FieldDescription>
                                                                    Enter your password.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <Field orientation="horizontal">
                                                    <Button
                                                        className="cursor-pointer"
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => loginForm.reset()}
                                                        disabled={logInUser.isPending} // Disable while loading
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        className="cursor-pointer"
                                                        type="submit"
                                                        form="login-form"
                                                        disabled={logInUser.isPending} // Disable while loading
                                                    >
                                                        {logInUser.isPending ? "Logining in..." : "Submit"}
                                                    </Button>
                                                </Field>
                                            </FieldGroup>
                                        </form>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {/* Signup Form */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className='cursor-pointer text-lg font-semibold' size="lg">Sign up</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                        aria-hidden="true"
                                    >
                                        <img
                                            src="./duck.gif"
                                            alt="logo"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="sm:text-center">Create an Account</DialogTitle>
                                        <DialogDescription className="sm:text-center">
                                            Add your credentials to create your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className='flex flex-col justify-center items-center gap-9'>
                                    {/* Signup form */}
                                    <div className="w-full p-10">
                                        <form
                                            id="signup-form"
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                signUpForm.handleSubmit()
                                            }}
                                        >
                                            <FieldGroup>
                                                <signUpForm.Field
                                                    name="u_qid"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>QID</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Create your identity 😎.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                {/* <FieldSeparator /> */}
                                                <signUpForm.Field
                                                    name="u_mail"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Mail</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                />
                                                                <FieldDescription>
                                                                    Enter your mail.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <signUpForm.Field
                                                    name="u_pass"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta.isTouched && !field.state.meta.isValid
                                                        return (
                                                            <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                                    aria-invalid={isInvalid}
                                                                    required
                                                                    type="password"
                                                                />
                                                                <FieldDescription>
                                                                    Enter your password.
                                                                </FieldDescription>
                                                                {isInvalid && (
                                                                    <FieldError errors={field.state.meta.errors} />
                                                                )}
                                                            </Field>
                                                        )
                                                    }}
                                                />
                                                <signUpForm.Subscribe
                                                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                                                    children={([canSubmit, isSubmitting]) => (
                                                        <div className='flex gap-3'>
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                className='cursor-pointer'
                                                                disabled={!canSubmit || createAccount.isPending}
                                                            >
                                                                {isSubmitting ? '...' : 'Submit'}
                                                            </Button>
                                                            <Button
                                                                type="reset"
                                                                className='cursor-pointer'
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    signUpForm.reset()
                                                                }}
                                                            >
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                            </FieldGroup>
                                        </form>
                                    </div>
                                    {/* Error message */}
                                    {createAccount.isError && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                                            <pre>{JSON.stringify(createAccount.error, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <div className='h-45 w-full' />

            <main className='w-full'>
                {/* Social Media */}
                <section id='philosophy-1' className='flex flex-row items-center gap-10 w-full p-5'>
                    {/* Image Container */}
                    <div id='philiosophy-1-image' className='flex-1'>
                        <img
                            src="/landing/vector-friends.jpg"
                            loading='lazy'
                            className='w-full aspect-square object-contain'
                            alt='vector friends'
                        />
                    </div>

                    {/* Text Container */}
                    <div id='philosophy-1-text' className='flex flex-1 flex-col gap-5'>
                        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-wrap break-words">
                            Social Media
                        </h2>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            In a shift from the isolated physical tribes of the ancient world to the digital global village, social media was celebrated as the ultimate bridge that dissolved borders, allowing a single voice to be heard by millions and fostering a level of human empathy and collective intelligence never before possible in history.
                        </p>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            Breaking the silence of the "anonymous masses" of the industrial age, these platforms were praised for giving every person a digital canvas to broadcast their unique quirks and talents, transforming the internet into a decentralized library of human identity where every "misfit" could finally find their kindred spirits.
                        </p>
                    </div>
                </section>

                <div className='h-45 w-full' />

                {/* Evolution of Social Media */}
                <section id='philosophy-2' className='flex flex-row items-center gap-10 w-full p-5'>
                    {/* Text Container */}
                    <div id='philosophy-2-text' className='flex flex-1 flex-col gap-5'>
                        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-wrap break-words">
                            Social Media Today
                        </h2>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            We used to love Social Media. In the late 90s and early 2000s, it felt like a miracle—a quiet bridge built just so we could finally find each other, share a thought, and feel a little less alone in the dark. It was a game-changer because it was built for us.
                        </p>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            But now? The bridge has become a marketplace. It’s a goldmine for advertisers and a battlefield for monopolies, where aggressive algorithms push past the limits of what is ethical just to keep us staring. It’s become a dark place, and I find myself wondering... what went wrong? Why did connection turn into competition? Why does the screen feel so heavy with negativity? We’re addicted to the very thing that makes us feel empty—consuming, producing, and curating until there’s nothing real left. Is it the algorithm? Or is it just that we’ve forgotten how to look at each other without a lens in the way?
                        </p>
                    </div>

                    {/* Image Container */}
                    <div id='philiosophy-2-image' className='flex-1'>
                        <img
                            src="/landing/woman-scrolling.avif"
                            loading='lazy'
                            className='w-full aspect-square object-contain'
                            alt='woman scrolling'
                        />
                    </div>
                </section>

                <div className='h-45 w-full' />

                {/* Qurirks of People */}
                <section id="philosophy-3" className='flex flex-row items-center gap-10 w-full p-5'>
                    {/* Image Container */}
                    <div id='philiosophy-3-image' className='flex-1'>
                        <img
                            src="/landing/quirks.avif"
                            loading='lazy'
                            className='w-full aspect-square object-contain'
                            alt='woman scrolling'
                        />
                    </div>

                    {/* Text Container */}
                    <div id='philosophy-3-text' className='flex flex-1 flex-col gap-5'>
                        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-wrap break-words">
                            People's Quirks
                        </h2>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            Unique traits are often recorded without consent and distributed to "cringe" communities, where personal eccentricities are weaponized as entertainment, leading to intense public humiliation and the fear of becoming a permanent meme.
                        </p>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            To avoid becoming targets of dogpiling, individuals often suppress their authentic quirks—a process known as "masking"—which leads to severe mental exhaustion, loss of identity, and the constant stress of monitoring one's own behavior to fit narrow digital norms.
                        </p>
                        <p className='text-muted-foreground text-xl text-wrap break-words'>
                            Recommendation engines often categorize non-conforming behavior as "low-quality" or "violating" based on mass reports from toxic users; this can lead to shadowbanning or account suspension, effectively deplatforming individuals for simply being different and cutting off their access to supportive communities.
                        </p>
                    </div>
                </section>

                <div className='h-45 w-full' />

                {/* Texting */}
                <section id="philosophy-4" className='flex flex-row items-center gap-10 w-full p-5'>
                    {/* Text Container */}
                    <div id='philosophy-4-text' className='flex flex-1 flex-col gap-5'>
                        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-wrap break-words">
                            Infinite Scrolling
                        </h2>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            The constant need to scroll, to keep up with the never-ending stream of content, has become a symbol of modern life. It's a never-ending race to keep up with the never-ending stream of content, a constant reminder of the constant need to scroll, to keep up with the never-ending stream of content.
                        </p>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            It's become such a habit that we do it unconsiously, without even realizing the impact it has on our mental health. The constant need to scroll, to keep up with the never-ending stream of content, has become a symbol of modern life.
                        </p>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            Bored? Open the app. Need to relax? Open the app. Need to unwind? Open the app. Need to distract? Open the app. Need to escape? Open the app.
                        </p>
                    </div>
                    {/* Image Container */}
                    <div id='philiosophy-4-image' className='flex-1'>
                        <img
                            src="/landing/woman-texting-2.avif"
                            loading='lazy'
                            className='w-full aspect-square object-contain'
                            alt='woman texting'
                        />
                    </div>
                </section>

                <div className='h-45 w-full' />

                {/* Solution */}
                <section id="philosophy-5" className='flex flex-row items-center gap-10 w-full p-5'>
                    {/* Image Container */}
                    <div id='philiosophy-5-image' className='flex-1'>
                        <img
                            src="/landing/happy usage.jpg"
                            loading='lazy'
                            className='w-full aspect-square object-contain'
                            alt='ethical usage'
                        />
                    </div>

                    {/* Text Container */}
                    <div id='philosophy-5-text' className='flex flex-1 flex-col gap-5'>
                        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-wrap break-words">
                            Our solution
                        </h2>
                        <p className="text-muted-foreground text-xl text-wrap break-words">
                            Our parents were right, but let's be honest we have to say online or we will be under the rock, so the soultion is simple and old school. It's not gatekeeped, it's just risky and ethical.
                        </p>
                        <ul className="text-muted-foreground text-xl text-wrap break-words list-item list-none">
                            <li>
                                <span className='underline'>No Ads, yes no ads whatsoever:</span>
                                We don't want those trackers to make our app heavy, social media is to connect not to advertise
                            </li>
                            <li>
                                <span className='underline'>No persistance:</span>
                                We are broke, and we don't want to store your data, of course it will be stored for a while for messaging, so we expect you to not abuse this feature
                            </li>
                            <li>
                                <span className='underline'>No recommendations:</span>
                                We believe social media is centralization and not personalization
                            </li>
                            <li>
                                <span className='underline'>Time Limits:</span>
                                Yes, strict time limits are enforced (not optional) for ethical and limited usage
                            </li>
                        </ul>
                    </div>
                </section>

                <div className='h-45 w-full' />
            </main>
            <footer>
                <section id="progress" className='flex flex-col justify-center items-center gap-10 w-full p-5'>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight flex flex-wrap gap-2"> Our progress so far <ConstructionIcon /> </h3>
                    <div className='flex flex-row-reverse gap-5 justify-center items-center'>
                        <p>Honest starts, constantly working on it to improve your experience 🦆🦆</p>
                        <img src="/duck.gif" className='h-18' alt='mascot' />
                    </div>
                    <div className="relative overflow-hidden w-full h-full py-20">
                        <Carousel slides={slideData} />
                    </div>
                    <div className='h-45' />
                    <Button variant="ghost" className="text-lg font-semibold">
                        Built by
                        <a href='https://github.com/17anirudh/quirks' target='_blank' className="underline">Anirudh</a>
                    </Button>
                </section>
            </footer>
        </div>
    );
}

