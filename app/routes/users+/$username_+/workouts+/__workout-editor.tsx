import {
	FormProvider,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Workout } from '@prisma/client'
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
import { type action } from './__workout-editor.server'

export const WorkoutEditorSchema = z.object({
	id: z.string().optional(),
})

export function WorkoutEditor({
	workout,
}: {
	workout?: SerializeFrom<
		Pick<Workout, 'id' >
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const params = useParams()

	const [form, fields] = useForm({
		id: 'workout-editor',
		constraint: getZodConstraint(WorkoutEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: WorkoutEditorSchema })
		},
		defaultValue: {
			...workout,
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
						to={`/users/${params?.username}/workouts/${params?.routineId}`}
						className="md:hidden"
					>
						<Icon className="text-body-md" name="arrow-left">
							Cancel edit
						</Icon>
					</Link>
					{workout ? (
						<input type="hidden" name="id" value={workout.id} />
					) : null}
					<div className="flex flex-col gap-1">
					    
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
