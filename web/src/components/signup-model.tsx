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
  FieldSeparator
} from "@/lib/components/ui/field"
import { Input } from "@/lib/components/ui/input"
import { signUp, clientSignUp } from '@/private/signup';

export default function LoginModal() {
  const QueryFunction = signUp();
      const form = useForm({
          defaultValues: {
              u_mail: '',
              u_qid: '',
              u_pass: ''
          },
          validators: {
              onSubmit: clientSignUp,
          },
          onSubmit: async ({ value }) => {
              const {data, isPending} = await QueryFunction.mutate(value)
          },
      })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className='cursor-pointer'>Sign Up</Button>
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
            <DialogTitle className="sm:text-center">Create Account</DialogTitle>
            <DialogDescription className="sm:text-center">
              Welcome stranger, let's know you to proceed.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className='flex flex-col justify-center items-center gap-9'>
            {/* signup form */}
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
                            <FieldLabel htmlFor={field.name}>QiD</FieldLabel>
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
                            Create your identity.
                            </FieldDescription>
                            {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                            )}
                        </Field>
                        )
                    }}
                    />
                    <FieldSeparator />
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
                            disabled={QueryFunction.isPending} // Disable while loading
                        >
                            Reset
                        </Button>
                        <Button
                            className="cursor-pointer"
                            type="submit"
                            form="signup-form"
                            disabled={QueryFunction.isPending} // Disable while loading
                        >
                            {QueryFunction.isPending ? "Logining in..." : "Submit"}
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
