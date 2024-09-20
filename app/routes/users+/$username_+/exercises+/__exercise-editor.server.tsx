import { parseWithZod } from '@conform-to/zod'
import { createId as cuid } from '@paralleldrive/cuid2'
import {
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	redirect,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { ExerciseEditorSchema } from './__exercise-editor'

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: ExerciseEditorSchema.superRefine(async (data, ctx) => {
			if (!data.id) return

			const exercise = await prisma.exercise.findUnique({
				select: { id: true },
				where: { id: data.id, OR: [{ ownerId: userId }, { ownerId: null }] },
			})
			if (!exercise) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Exercise not found',
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

	const { id: exerciseId, name, description } = submission.value

	const updatedExercise = await prisma.exercise.upsert({
		select: { id: true, owner: { select: { username: true } } },
		where: { id: exerciseId ?? '__new_exercise__' },
		create: {
			ownerId: userId, // TODO: allow admin to create system-wide exercise 'null'
			name,
			description: description || null,
			typeId: 'strength',
		},
		update: {
			name,
			description: description || null,
		},
	})

	return redirect(
		`/users/${params?.username}/exercises/${updatedExercise.id}`,
	)
}
