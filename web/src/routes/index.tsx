import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Vortex } from '@/lib/components/vortex'
import { ConfettiFireworks } from '@/components/fireworks'
import { Highlighter } from '@/lib/components/ui/highlighter'
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
        <div className='min-h-dvh w-screen items-center flex flex-col overflow-x-hidden'>
            <header className='flex flex-col w-full justify-center items-center gap-6 relative'>
                <div className='absolute z-10 top-5 left-50 bg-black'>
                    <ConfettiFireworks>
                        <Highlighter action='underline'>
                            <h3 className="font-extrabold uppercase mt-5 scroll-m-20 text-2xl font-serif tracking-tight text-center">
                                Quirks
                            </h3>
                        </Highlighter>
                    </ConfettiFireworks>
                </div>
                {/* <div className='absolute top-0'>
                    <img src='/landing/mindless crowd.avif' className='h-[70%] object-cover' />
                </div> */}
            </header>
            <div className="flex gap-7">
                {/* Login Form */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className='cursor-pointer'>Log in</Button>
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
    )
}

