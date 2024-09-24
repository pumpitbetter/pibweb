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
import { RoutineEditorSchema } from './__routine-editor'

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

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

	const { id: routineId, name, description } = submission.value

	const updatedRoutine = await prisma.routine.upsert({
		select: { id: true, owner: { select: { username: true } } },
		where: { id: routineId ?? '__new_routine__' },
		create: {
			ownerId: userId, // TODO: allow admin to create system-wide routine 'null'
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
		`/users/${params?.username}/routines/${updatedRoutine.id}`,
	)
}
