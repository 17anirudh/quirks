import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { toast } from "sonner"
import { ImageUpIcon } from 'lucide-react'
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/lib/components/ui/field"
import { Input } from "@/lib/components/ui/input"
import Loader from '@/components/loader'
import { Textarea } from '@/lib/components/ui/textarea'
import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/lib/components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Keys } from '@/context/keys'
import { createPost, queryMe } from '@/api/api'
import { useAuth } from '@/context/auth-provider'

export const Route = createFileRoute('/_protected/profile/create')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
  pendingMinMs: 0
})

const postSchema = z.object({
  p_text: z
    .string()
    .min(1, "Post cannot be empty")
    .max(4000, "Post cannot be more than 4000 characters"), // Post content
  p_image: z.instanceof(File).or(z.literal(null))
})

export type PostSchema = z.infer<typeof postSchema>

function RouteComponent() {
  const navigate = useNavigate()
  const { qid } = useAuth()
  const { data: res, isPending } = useQuery({
    queryKey: Keys.me,
    queryFn: () => queryMe(qid!)
  })

  const queryClient = Route.useRouteContext().queryClient
  const form = useForm({
    defaultValues: {
      p_text: "",
      p_image: null as File | null
    },
    validators: {
      onSubmit: postSchema,
    },
    onSubmit: async ({ value }) => {
      uploadForm.mutate(value)
    },
  })
  const uploadForm = useMutation({
    mutationKey: ['post'],
    mutationFn: async (value: PostSchema) => createPost(value, res!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success("Post uploaded")
      form.reset()
      setBlobURL(null)
      setNewPfp(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
      navigate({ to: '/profile' })
    },
    onError: (error) => {
      console.error(error.message)
      toast.error(error instanceof Error ? error.message : "Failed to upload pfp")
      blobURL ?? setBlobURL(null)
      newPfp ?? setNewPfp(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  })
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [newPfp, setNewPfp] = useState<File | null>(null)
  const [blobURL, setBlobURL] = useState<string | null>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, field: any) => {
    const file = e.target.files?.[0] ?? null
    field.handleChange(file)
    setNewPfp(file)
    if (file) {
      setBlobURL(URL.createObjectURL(file))
    } else {
      setBlobURL(null)
    }
  }
  return (
    <>
      {isPending ? <Loader /> : (
        <div className="w-full p-4 flex flex-col gap-5 justify-center items-center flex-1 relative">
          <div className="flex flex-col gap-2 border-2 p-5 w-11/12 sm:w-8/12 mb-10">
            <div className="flex flex-wrap gap-3">
              {/* Profile photo */}
              <div className="w-18 h-18 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                <img
                  src={res?.user.u_pfp || "/pfp.webp"}
                  alt={res?.user.u_qid ? `${res?.user.u_qid} profile photo` : "profile picture"}
                  className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Qid and time */}
              <div className="flex flex-col">
                {/* Qid */}
                <h4 className="scroll-m-20 text-xl tracking-tight">
                  @{res?.user.u_qid!}
                </h4>
                {/* Time */}
                <h4 className="scroll-m-20 tracking-tight text-green-500 animate-pulse">Just now</h4>
              </div>
            </div>
            {/* Actual User form */}
            <form
              id="post-upload-form"
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="p_text"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <Textarea
                          id="form-tanstack-textarea-about"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="I'm a software engineer..."
                          className="leading-7 [&:not(:first-child)]:mt-6 break-words whitespace-normal overflow-hidden w-10/12"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="p_image"
                  children={(field) => (
                    <Field>
                      <Input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageChange(e, field)}
                        onBlur={field.handleBlur}
                        className='pointer-events-none'
                      />

                      <Button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-fit h-fit overflow-hidden cursor-pointer"
                      >
                        {blobURL ? (
                          <img
                            src={blobURL}
                            className="w-full h-full object-cover hover:blur-[2px] bg-transparent"
                            draggable={false}
                          />
                        ) : (
                          <span className="flex items-center gap-2">
                            Upload Image <ImageUpIcon className="w-5 h-5" />
                          </span>
                        )}
                      </Button>

                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <div className='flex gap-3'>
                      <Button
                        type="submit"
                        variant="outline"
                        className='cursor-pointer'
                        disabled={!canSubmit || uploadForm.isPending}
                      >
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
      )}
    </>
  )
}