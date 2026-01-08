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
import { QueryLogin } from "@/auth/login"
import { EnterUserSchema } from '@/schemas/User'

export const Route = createFileRoute('/onboard/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const QueryFunction = QueryLogin();
      const form = useForm({
          defaultValues: {
              mail: '',
              pass: ''
          },
          validators: {
              onSubmit: EnterUserSchema,
          },
          onSubmit: async ({ value }) => {
              QueryFunction.mutate(value)
          },
      })
      return (
          <div className='flex flex-col min-h-screen w-screen justify-center items-center gap-9'>
              <pre>routes/onboard/login.tsx</pre>
              {/* Login form */}
              <div className="w-11/12 sm:w-8/12 p-10 border border-amber-300">
                  <form
                  id="onboard-form"
                  onSubmit={(e) => {
                      e.preventDefault()
                      form.handleSubmit()
                  }}
                  >
                  <FieldGroup>
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
                                  aria-invalid={isInvalid}
                                  required
                              />
                              <FieldDescription>
                              Enter your Mail.
                              </FieldDescription>
                              {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                              )}
                          </Field>
                          )
                      }}
                      />
                      <form.Field
                      name="pass"
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
                                  type='password'
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
                              form="onboard-form"
                              disabled={QueryFunction.isPending} // Disable while loading
                          >
                              {QueryFunction.isPending ? "Loging Account..." : "Submit"}
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
