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
import { profileSchema } from '@/types/user';
import z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { SUPABASE_CLIENT } from '@/hooks/variables';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

const clientSignUp = profileSchema.pick({
    u_mail: true,
    u_qid: true,
}).extend({ 
    u_pass: z
        .string()
        .min(8, "Your password must atleast 8 characters")
        .max(300, "Your password must be atmost 300 characters") 
})

export default function SignupModal() {
    const navigate = useNavigate();
    const signUpMutation = useMutation({
        mutationFn: async (value: z.infer<typeof clientSignUp>) => {
            const { data: authData, error: authError } = await SUPABASE_CLIENT
                .auth
                .signUp({
                    email: value.u_mail,
                    password: value.u_pass
                })
            if (authError) throw authError
            try {
                const token = authData.session?.access_token;
                if (!token) throw new Error('No authentication token available');
                
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token
                    },
                    body: JSON.stringify(value.u_qid)
                })
            }
            catch (e) {
                throw e
            }
        },
        onSuccess: () => {
            toast.success(`Account created, welcome 🥳`)
            navigate({ to: '/', replace: true })
        },
        onError: (e) => {
            toast.error(`${e.message}`)
            throw new Error(e.message)
        },
    })
    const form = useForm({
        defaultValues: {
            u_qid: '',
            u_mail: '',
            u_pass: '',
        },
        validators: {
            onSubmit: clientSignUp,
        },
        onSubmit: async ({ value }) => {
            signUpMutation.mutate(value)
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
                        <Button type="submit" variant="outline" className='cursor-pointer' disabled={!canSubmit || signUpMutation.isPending}>
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
            {signUpMutation.isError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                    <pre>{JSON.stringify(signUpMutation.error, null, 2)}</pre> 
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
