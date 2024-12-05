import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { type Params } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	RoutineEditorAddExercisesSchema,
	RoutineEditorSchema,
} from './__routine-editor'

export async function actionSaveRoutine({
	request,
	params,
	formData,
}: {
	request: Request
	params: Params<string>
	formData: FormData
}) {
	const userId = await requireUserId(request)
	const submission = await parseWithZod(formData, {
		schema: RoutineEditorSchema.superRefine(async (data, ctx) => {
			if (!data.id) return

			const routine = await prisma.routine.findUnique({
				select: { id: true },
				where: { id: data.id, OR: [{ ownerId: userId }, { ownerId: null }] },
			})
			if (!routine) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Routine not found',
				})
			}
		}).transform(async ({ ...data }) => {
			return {
				...data,
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id: routineId, name, description, videoUrl } = submission.value

	const updatedRoutine = await prisma.routine.upsert({
		select: { id: true, owner: { select: { username: true } } },
		where: { id: routineId ?? '__new_routine__' },
		create: {
			ownerId: userId, // TODO: allow admin to create system-wide routine 'null'
			name,
			description: description || null,
			videoUrl: videoUrl || null,
			typeId: 'strength',
			circuits: {
				create: [
					{
						sequence: 0,
					},
				],
			},
		},
		update: {
			name,
			description: description || null,
			videoUrl: videoUrl || null,
			// TODO: re-order circuits and exercises???
		},
	})

	return redirect(`/users/${params?.username}/routines/${updatedRoutine.id}`)
}

export async function actionAddExercises({
	request,
	params,
	formData,
}: {
	request: Request
	params: Params<string>
	formData: FormData
}) {
	const userId = await requireUserId(request)

	const submission = await parseWithZod(formData, {
		schema: RoutineEditorAddExercisesSchema.superRefine(async (data, ctx) => {
			if (!data.routineId) return

			const routine = await prisma.routine.findUnique({
				select: {
					id: true,
					circuits: {
						select: {
							id: true,
							sequence: true,
							exercises: {
								select: {
									id: true,
									exercise: {
										select: {
											id: true,
											name: true,
										},
									},
								},
							},
						},
					},
				},
				where: { id: data.routineId, ownerId: userId },
			})

			if (!routine) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Routine not found',
				})
			}
		}).transform(async ({ ...data }) => {
			return {
				...data,
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { routineId, exercises: exerciseStr } = submission.value
	const exercises = exerciseStr.split(',')

	const routine = await prisma.routine.findUnique({
		select: {
			id: true,
			circuits: {
				select: {
					id: true,
					sequence: true,
					exercises: {
						select: {
							id: true,
							sequence: true,
							exercise: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { sequence: 'asc' },
					},
				},
				orderBy: { sequence: 'asc' },
			},
		},
		where: { id: routineId, ownerId: userId },
	})

	invariantResponse(
		routine?.circuits[0]?.id,
		'Invalid routine, should have at least one circuit',
	)
	const circuitId = routine.circuits[0].id

	let nextExerciseSequence =
		(routine?.circuits[0]?.exercises.at(-1)?.sequence || -1) + 1

	// expect routine to have at least first circuit pre-created
	// it should be created at the same time the routine is created
	// expect the query to order the circuits by ascending `sequence` so that
	// index 0 is always the first circuit
	// expect the query to order the circut exercises by ascending `sequence`
	// so that last(routine.circuits[0].exercises).sequence is the last sequence

	const exerciseCircuitsData = exercises.map((id) => ({
		routineId,
		circuitId,
		exerciseId: id,
		sequence: nextExerciseSequence++,
	}))
	await prisma.circuitExercise.createMany({
		data: exerciseCircuitsData,
	})

	return redirect(`/users/${params?.username}/routines/${routineId}/edit`)
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case 'save-routine':
			return actionSaveRoutine({ request, params, formData })
		case 'add-exercises':
			return actionAddExercises({ request, params, formData })
	}
}
