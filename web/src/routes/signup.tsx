import { createFileRoute } from '@tanstack/react-router'
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
import { QuerySignup } from "@/supabase/auth/signup"
import { SignUserSchema } from '@/schemas/User'
import { Button } from '@/lib/components/ui/button'
import TocDialog from '@/components/toc-dialog'
import { Scroller } from '@/lib/components/ui/scroller'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
    const QueryFunction = QuerySignup();
    const form = useForm({
        defaultValues: {
            u_name: '',
            u_qid: '',
            u_mail: '',
            u_pass: '',
        },
        validators: {
            onSubmit: SignUserSchema,
        },
        onSubmit: async ({ value }) => {
            QueryFunction.mutate(value)
        },
    })
  return (
    <Scroller className='flex flex-col justify-center items-center gap-9'>
        {/* Signup form */}
        <div className="w-10/12 sm:w-7/12 p-10">
            <div className="flex flex-col items-center justify-center rounded-full">
                <img
                src="./duck.gif"
                alt="logo"
                className="h-10 w-10 rounded-full"
                />
                <h1 className="sm:text-center font-semibold">Create an Account</h1>
                <p className="sm:text-center sm:font-semibold">We just need to know few things</p>
            </div>
            <form
            id="signup-form"
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            >
            <FieldGroup>
                <form.Field
                name="u_name"
                children={(field) => {
                    const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
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
                        Enter your name.
                        </FieldDescription>
                        {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                        )}
                    </Field>
                    )
                }}
                />
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
                <TocDialog />
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
                        {QueryFunction.isPending ? "Creating Account..." : "Submit"}
                    </Button>
                </Field>
            </FieldGroup>
            </form>
        </div>
        {/* Error message */}
        {QueryFunction.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                <pre>{JSON.stringify(QueryFunction.error, null, 2)}</pre> 
            </div>
        )}
    </Scroller>
  )
}
