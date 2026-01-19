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
import { createAccountSchema } from './signup-modal';
import { type QueryClient, useMutation } from "@tanstack/react-query";
import z from "zod";
import { SUPABASE_CLIENT } from "@/hooks/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const logInUserSchema = createAccountSchema.pick({
  u_mail: true,
  u_pass: true
})

type props = {
  client: QueryClient
}

export default function LoginModal({ client }: props) {
  const navigate = useNavigate()
  const logInUser = useMutation({
    mutationKey: ['login'],
    mutationFn: async (values: z.infer<typeof logInUserSchema>) => {
      const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signInWithPassword({
        email: values.u_mail,
        password: values.u_pass
      })
      if (!authData || authError) throw authError
      return authData
    },
    onError: (err) => {
      toast.error(err.message + '😅')
      console.error(err.message)
    },
    onSuccess: (data) => {
      // Manual set query
      client.setQueryData(['auth'], data.session)
      toast.success("Welcome back 🦆🦆")
      navigate({ to: '/home', replace: true })
    }
  })
  const form = useForm({
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
                <Field orientation="horizontal">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
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
  );
}