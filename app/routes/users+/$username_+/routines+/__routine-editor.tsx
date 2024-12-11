import {
	FormProvider,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { type SerializeFrom } from '@remix-run/node'
import { Form, Link, useActionData, useParams } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList, Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { ExercisePickerDialog } from '#app/routes/users+/$username_+/routines+/exercise-picker-dialog.tsx'
import { useIsPending } from '#app/utils/misc.tsx'
import { type CircuitExerciseInfo } from './$routineId'
import { type loader } from './$routineId_.edit'
import { CircuitCard } from './__circuit-card'
import { type action } from './__routine-editor.server'

const nameMinLength = 1
const nameMaxLength = 100
const descriptionMinLength = 1
const descriptionMaxLength = 10000

export const RoutineEditorAddExercisesSchema = z.object({
	intent: z.string(),
	routineId: z.string(),
	exercises: z.string(),
})

export const RoutineEditorSchema = z.object({
	intent: z.string(),
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
	loaderData,
}: {
	loaderData: SerializeFrom<typeof loader>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const params = useParams()
	const routine = loaderData?.routine
	const exercises = loaderData?.exercises

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const [form, fields] = useForm({
		id: 'routine-editor',
		constraint: getZodConstraint(RoutineEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: RoutineEditorSchema })
		},
		defaultValue: {
			id: routine?.id,
			name: routine?.name,
			description: routine?.description,
			videoUrl: routine?.videoUrl,
		},
		shouldRevalidate: 'onBlur',
	})

	const [circuits, setCircuits] = useState(initializeFromLoaderData)

	function initializeFromLoaderData() {
		let circuitsMap = new Map<string, CircuitExerciseInfo[]>()
		if (loaderData?.routine?.circuits) {
			for (let c of loaderData?.routine?.circuits) {
				circuitsMap.set(
					c.id,
					loaderData?.routine?.circuitExercises
						?.filter((i) => i.circuitId === c.id) // filter out all exercises other then given `circuitId`
						.sort((a, b) => (a.sequence < b.sequence ? -1 : 0)), // sort asc within the above results
				)
			}
		}
		return circuitsMap
	}

	const firstCircuitId = loaderData?.routine?.circuits?.[0]?.id || ''
	const firstCircuitExercises = circuits?.get(firstCircuitId)

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id && firstCircuitExercises?.length) {
			setCircuits((c) => {
				const activeExerciseIdx = firstCircuitExercises.findIndex(
					(e) => e.id === active.id,
				)
				const activeCircuitId =
					firstCircuitExercises[activeExerciseIdx]?.circuitId || ''

				const overExerciseIdx = firstCircuitExercises.findIndex(
					(e) => e.id === over?.id,
				)

				if (
					firstCircuitExercises[activeExerciseIdx] &&
					firstCircuitExercises[overExerciseIdx]
					// both from same circuit?
				) {
					if (activeExerciseIdx < overExerciseIdx) {
						// if item has been dragged down
						if (firstCircuitExercises.length - 1 > overExerciseIdx) {
							// dragged down *not* over the last place
							firstCircuitExercises[activeExerciseIdx].sequence =
								((firstCircuitExercises?.[overExerciseIdx + 1]?.sequence ?? 0) +
									(firstCircuitExercises?.[overExerciseIdx]?.sequence ?? 0)) /
								2
						} else {
							// dragged down over the last place
							firstCircuitExercises[activeExerciseIdx].sequence =
								(firstCircuitExercises?.[overExerciseIdx]?.sequence ?? 0) + 1
						}
					} else {
						// if item has been dragged up
						if (overExerciseIdx > 0) {
							// dragged up *not* into first place
							firstCircuitExercises[activeExerciseIdx].sequence =
								((firstCircuitExercises?.[overExerciseIdx - 1]?.sequence ?? 0) +
									(firstCircuitExercises?.[overExerciseIdx]?.sequence ?? 0)) /
								2
						} else if (firstCircuitExercises[0] && firstCircuitExercises[1]) {
							// dragged up into first place

							firstCircuitExercises[0].sequence =
								firstCircuitExercises[1].sequence / 2
							firstCircuitExercises[activeExerciseIdx].sequence = 0
						}
					}
				}

				// todo: submit to update the database, here??? after the state updates and rerenders?

				const newCircuits = new Map(c)
				const exercises = newCircuits?.get(activeCircuitId)
				if (exercises) {
					const newExercises = [...exercises].sort((a, b) =>
						a.sequence < b.sequence ? -1 : 0,
					)
					newCircuits.set(
						activeCircuitId,
						newExercises, // sort asc within the above results
					)
				}

				return newCircuits
			})

		}
	}

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
						<input type="hidden" name="id" value={routine?.id} />
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
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; zpicture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
								className="aspect-video w-full"
							></iframe>
						)}
						<h5 className="w-f whitespace-break-spaces py-4 text-h5">
							Exercises
						</h5>
						{firstCircuitExercises && (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={firstCircuitExercises}
									strategy={verticalListSortingStrategy}
								>
									<CircuitCard
										id={firstCircuitId}
										circuitExercises={firstCircuitExercises}
										children={
											<ExercisePickerDialog
												routineId={params?.routineId}
												exercises={exercises}
											/>
										}
									/>
								</SortableContext>
							</DndContext>
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
						name="intent"
						value="save-routine"
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
