import {
	FormProvider,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Routine } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, Link, useActionData, useParams } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList, Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useIsPending } from '#app/utils/misc.tsx'
import { type action } from './__routine-editor.server'

const nameMinLength = 1
const nameMaxLength = 100
const descriptionMinLength = 1
const descriptionMaxLength = 10000

export const RoutineEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(nameMinLength).max(nameMaxLength),
	description: z
		.string()
		.min(descriptionMinLength)
		.max(descriptionMaxLength)
		.optional(),
	videoUrl: z.string().url().optional(),
})

export function RoutineEditor({
	routine,
}: {
	routine?: SerializeFrom<
		Pick<Routine, 'id' | 'name' | 'description' | 'videoUrl'>
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const params = useParams()

	const [form, fields] = useForm({
		id: 'routine-editor',
		constraint: getZodConstraint(RoutineEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: RoutineEditorSchema })
		},
		defaultValue: {
			...routine,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="absolute inset-0">
			<FormProvider context={form.context}>
				<Form
					method="POST"
					className="flex h-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-10 pb-28 pt-12"
					{...getFormProps(form)}
					encType="multipart/form-data"
				>
					{/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
					<button type="submit" className="hidden" />
					<Link
						prefetch="intent"
						to={`/users/${params?.username}/routines/${params?.routineId}`}
						className="md:hidden"
					>
						<Icon className="text-body-md" name="arrow-left">
							Cancel edit
						</Icon>
					</Link>
					{routine ? (
						<input type="hidden" name="id" value={routine.id} />
					) : null}
					<div className="flex flex-col gap-1">
						<Field
							labelProps={{ children: 'Name' }}
							inputProps={{
								autoFocus: true,
								...getInputProps(fields.name, { type: 'text' }),
							}}
							errors={fields.name.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Description' }}
							textareaProps={{
								...getTextareaProps(fields.description),
							}}
							errors={fields.description.errors}
						/>
						<Field
							labelProps={{ children: 'Video URL' }}
							inputProps={{
								autoFocus: false,
								...getInputProps(fields.videoUrl, { type: 'url' }),
							}}
							errors={fields.videoUrl.errors}
						/>
						{fields.videoUrl.value && (
							<iframe
								src={fields.videoUrl.value}
								title="YouTube video player"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
								className="aspect-video w-full"
							></iframe>
						)}
					</div>
					<ErrorList id={form.errorId} errors={form.errors} />
				</Form>
				<div className={floatingToolbarClassName}>
					<Button variant="destructive" {...form.reset.getButtonProps()}>
						Reset
					</Button>
					<StatusButton
						form={form.id}
						type="submit"
						disabled={isPending}
						status={isPending ? 'pending' : 'idle'}
					>
						Save
					</StatusButton>
				</div>
			</FormProvider>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
