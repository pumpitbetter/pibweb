import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Exercise } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { useState } from 'react'
import { CheckboxField } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useIsPending } from '#app/utils/misc.tsx'
import { Button } from '../../../../components/ui/button'
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '../../../../components/ui/dialog'
import { RoutineEditorAddExercisesSchema } from './__routine-editor'

function ExercisePickerDialog({
	routineId,
	exercises,
}: {
	routineId: string | undefined
	exercises: SerializeFrom<Pick<Exercise, 'id' | 'name'>[]> | undefined
}) {
	const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])
	const isPending = useIsPending()
	const [form, fields] = useForm({
		id: 'add-exercises',
		constraint: getZodConstraint(RoutineEditorAddExercisesSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: RoutineEditorAddExercisesSchema })
		},
	})

	return (
		<Dialog>
			<Form method="POST" {...getFormProps(form)}>
				<input type="hidden" name="routineId" value={routineId} />
				<input type="hidden" name="exercises" value={selectedExerciseIds} />
				<DialogTrigger asChild>
					<Button variant="outline">Add exercises</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Add exercises</DialogTitle>
						<DialogDescription>
							Select exercises to add to your routine.
						</DialogDescription>
					</DialogHeader>

					<div className="flex items-center space-x-2">
						<fieldset>
							<ul className="grid flex-1 gap-2">
								{exercises &&
									exercises.map((exercise) => (
										<li key={exercise.id} className="items-top flex space-x-2">
											<CheckboxField
												labelProps={{
													htmlFor: fields.exercises?.id,
													children: exercise.name,
												}}
												buttonProps={{
													...getInputProps(fields?.exercises!, {
														type: 'checkbox',
														value: exercise.id,
													}),
													onCheckedChange: (s) => {
														console.log('onCheckedChanged', s)
														s
															? setSelectedExerciseIds((v) => [
																	...v,
																	exercise.id,
																])
															: setSelectedExerciseIds((v) =>
																	v.filter((i) => i !== exercise.id),
																)
													},
												}}
												errors={fields?.exercises?.errors}
											/>
										</li>
									))}
							</ul>
						</fieldset>
					</div>

					<DialogFooter className="sm:justify-start">
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>

						<StatusButton
							type="submit"
							form={form.id}
							name="intent"
							value="add-exercises"
							variant="outline"
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							disabled={isPending}
							className="w-full max-md:aspect-square max-md:px-0"
						>
							<span className="max-md:hidden">Add</span>
						</StatusButton>
					</DialogFooter>
				</DialogContent>
			</Form>
		</Dialog>
	)
}

export { ExercisePickerDialog }
