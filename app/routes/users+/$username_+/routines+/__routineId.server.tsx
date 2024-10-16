import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { Params } from '@remix-run/react'

const DeleteFormSchema = z.object({
	intent: z.literal('delete-routine'),
	routineId: z.string(),
})

const StartFormSchema = z.object({
	intent: z.literal('start-routine'),
	routineId: z.string(),
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

	const { routineId } = submission.value

	const routine = await prisma.routine.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		where: { id: routineId },
	})
	invariantResponse(routine, 'Not found', { status: 404 })

	const isOwner = routine?.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:routine:own` : `delete:routine:any`,
	)

	await prisma.routine.delete({ where: { id: routine.id } })

	return redirectWithToast(`/users/${params?.username}/routines`, {
		type: 'success',
		title: 'Success',
		description: 'Your routine has been deleted.',
	})
}

export async function actionStart({
    request,
	params,
	formData,
}: {
	request: Request
	params: Params<string>
	formData: FormData
}) {
	console.log('actionStart')
	const userId = await requireUserId(request)

	const intent = formData.get('intent')

	console.log('intent', intent)

	const submission = parseWithZod(formData, {
		schema: StartFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { routineId } = submission.value

	const routine = await prisma.routine.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		where: { id: routineId },
	})
	invariantResponse(routine, 'Not found', { status: 404 })

	const isOwner = routine?.ownerId === userId
	if (!isOwner) {
		return json({ result: submission.reply() }, { status: 401 })
	}

	const workout = await prisma.workout.create({
		data: {
			ownerId: userId,
			routineId: routine.id,
		},
	})

	return redirectWithToast(
		`/users/${params?.username}/workouts/${workout.id}`,
		{
			type: 'success',
			title: 'Success',
			description: 'Your routine has been started.',
		},
	)
}
