import { Button } from '@/lib/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/components/ui/dialog';
import { useForm } from "@tanstack/react-form"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/lib/components/ui/field"
import { Input } from "@/lib/components/ui/input"
import { profileSchema } from '@/services/user';
import z from 'zod';
<<<<<<< HEAD
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPABASE_CLIENT } from '@/hooks/variables';
=======
import { type QueryClient, useMutation } from '@tanstack/react-query';
import { SUPABASE_CLIENT } from '@/hooks/utils';
>>>>>>> fix-attempt-backup
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import Loader from './loader';

export const createAccountSchema = profileSchema.pick({
    u_qid: true,
<<<<<<< HEAD
=======
    u_mail: true
>>>>>>> fix-attempt-backup
}).extend({
    u_pass: z
        .string()
        .min(8, "Your password must atleast 8 characters")
        .max(300, "Your password must be atmost 300 characters")
})

<<<<<<< HEAD
export default function SignupModal() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const signUpMutation = useMutation({
        mutationFn: async (value: z.infer<typeof clientSignUp>) => {
            const { data: authData, error: authError } = await SUPABASE_CLIENT
                .auth
                .signUp({
                    email: value.u_mail,
                    password: value.u_pass,
                    options: {
                        data: {
                            "u_qid": value.u_qid
                        }
                    }
                })
            if (authError) throw authError
            const token = authData.session?.access_token;
            if (!token) throw new Error('No authentication token available');

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/create`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ u_qid: value.u_qid })
            })

            if (!res.ok) throw new Error("Backend sync failed");

            return authData.user
        },
        onSuccess: (newUserData) => {
            queryClient.setQueryData(['currentUser'], newUserData);
            toast.success(`Account created, welcome 🥳`)
            navigate({ to: '/', replace: true })
        },
        onError: (e) => {
            toast.error(`${e.message}`)
            throw new Error(e.message)
=======
export default function SignupModal({ client }: { client: QueryClient }) {
    const navigate = useNavigate()
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
>>>>>>> fix-attempt-backup
        },
        onSuccess: (session) => {
            client.setQueryData(['auth'], session)
            toast.success("Account created successfully 🦆🦆")
            navigate({ to: '/home', replace: true })
        }
    })

    const form = useForm({
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
                                form.handleSubmit()
                            }}
                        >
                            <FieldGroup>
                                <form.Field
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
                                <form.Field
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
                                <form.Field
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
                                <form.Subscribe
                                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                                    children={([canSubmit, isSubmitting]) => (
                                        <div className='flex gap-3'>
<<<<<<< HEAD
                                            <Button type="submit" variant="outline" className='cursor-pointer' disabled={!canSubmit || signUpMutation.isPending}>
=======
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                className='cursor-pointer'
                                                disabled={!canSubmit || createAccount.isPending}
                                            >
>>>>>>> fix-attempt-backup
                                                {isSubmitting ? '...' : 'Submit'}
                                            </Button>
                                            <Button
                                                type="reset"
                                                className='cursor-pointer'
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    form.reset()
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
<<<<<<< HEAD
                    {signUpMutation.isError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                            <pre>{JSON.stringify(signUpMutation.error, null, 2)}</pre>
=======
                    {createAccount.isError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                            <pre>{JSON.stringify(createAccount.error, null, 2)}</pre>
>>>>>>> fix-attempt-backup
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
