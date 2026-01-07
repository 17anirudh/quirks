import { createFileRoute } from '@tanstack/react-router'
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signup_schema, authMutation } from "@/auth/variables"

export const Route = createFileRoute('/onboard/signup')({
  component: App,
})

function App() {
    const QueryFunction = authMutation();
    const form = useForm({
        defaultValues: {
            qid: '',
            name: '',
            mail: '',
            password: ''
        },
        validators: {
            onSubmit: signup_schema,
        },
        onSubmit: async ({ value }) => {
            QueryFunction.mutate(value)
        },
    })
    return (
        <div className='flex flex-col min-h-screen w-screen justify-center items-center gap-9'>
            <pre>routes/signup.tsx</pre>
            {/* Signup form */}
            <div className="w-11/12 sm:w-8/12 p-10 border border-amber-300">
                <form
                id="signup-form"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                >
                <FieldGroup>
                    <form.Field
                    name="qid"
                    children={(field) => {
                        const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Qid</FieldLabel>
                            <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="winterz"
                            autoComplete="off"
                            type="text"
                            required
                            />
                            <FieldDescription>
                                😎 Your unique id, (you can change it later)
                            </FieldDescription>
                            {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                            )}
                        </Field>
                        )
                    }}
                    />
                    <form.Field
                    name="name"
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
                                placeholder="Denji"
                                aria-invalid={isInvalid}
                                type="text"
                            />
                            <FieldDescription>
                            Enter your name 😎.
                            </FieldDescription>
                            {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                            )}
                        </Field>
                        )
                    }}
                    />
                    <form.Field
                    name="mail"
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
                                placeholder="johndoe@yahoo.co.in"                        
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
                    name="password"
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
                            Enter your mail.
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
        </div>
    )
}