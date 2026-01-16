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
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPABASE_CLIENT } from '@/hooks/variables';
import { toast } from 'sonner';

const clientLogInSchema = profileSchema.pick({
  u_mail: true,
}).extend({
  u_pass: z
    .string()
    .min(8, "Your password must atleast 8 characters")
    .max(300, "Your password must be atmost 300 characters")
})

export default function LoginModal() {
  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const logInMutation = useMutation({
    mutationFn: async (value: z.infer<typeof clientLogInSchema>) => {
      const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signInWithPassword({
        email: value.u_mail,
        password: value.u_pass
      })
      if (authError || !authData) throw authError
      return authData.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user)
      navigate({ to: '/home', replace: true })
    },
    onError: (error) => {
      toast.error(`${error.message} Try again`)
    }
  })
  const form = useForm({
    defaultValues: {
      u_mail: '',
      u_pass: ''
    },
    validators: {
      onSubmit: clientLogInSchema,
    },
    onSubmit: async ({ value }) => {
      logInMutation.mutate(value)
    },
  })
  return (
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
                form.handleSubmit()
              }}
            >
              <FieldGroup>
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
                      <Button type="submit" variant="outline" className='cursor-pointer' disabled={!canSubmit || logInMutation.isPending}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
