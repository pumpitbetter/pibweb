import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { json, type Params } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

const DeleteFormSchema = z.object({
	intent: z.literal('delete-workout'),
	workoutId: z.string(),
})

const StopFormSchema = z.object({
	intent: z.literal('stop-workout'),
	workoutId: z.string(),
})

export async function actionDelete({
	request,
	params,
	formData,
}: {
	request: Request
	params: Params<string>
	formData: FormData
}) {
	const userId = await requireUserId(request)
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { workoutId } = submission.value

	const workout = await prisma.workout.findFirst({
		select: {
			id: true,
			ownerId: true,
			deleted: false,
			owner: { select: { username: true } },
		},
		where: { id: workoutId },
	})
	invariantResponse(workout, 'Not found', { status: 404 })

	const isOwner = workout?.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:workout:own` : `delete:workout:any`,
	)

	await prisma.workout.update({
		where: { id: workout.id },
		data: { deleted: true },
	})

	return redirectWithToast(`/users/${params?.username}/workouts`, {
		type: 'success',
		title: 'Success',
		description: 'Your workout has been deleted.',
	})
}

export async function actionStop({
	request,
	params,
	formData,
}: {
	request: Request
	params: Params<string>
	formData: FormData
}) {
	const userId = await requireUserId(request)
	const submission = parseWithZod(formData, {
		schema: StopFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { workoutId } = submission.value

	const workout = await prisma.workout.findFirst({
		select: {
			id: true,
			ownerId: true,
			deleted: false,
            stoppedAt: true,
			owner: { select: { username: true } },
		},
		where: { id: workoutId },
	})
	invariantResponse(workout, 'Not found', { status: 404 })

	const isOwner = workout?.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:workout:own` : `delete:workout:any`,
	)

	await prisma.workout.update({
		where: { id: workout.id },
		data: { stoppedAt: new Date() },
	}) 
 
	return redirectWithToast(`/users/${params?.username}/workouts/${workout.id}`, {
		type: 'success',
		title: 'Success',
		description: 'Your workout has been stopped.',
	})
}
