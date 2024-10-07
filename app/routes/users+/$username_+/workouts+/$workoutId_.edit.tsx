import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { WorkoutEditor } from './__workout-editor.tsx'

export { action } from './__workout-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const workout = await prisma.workout.findFirst({
		select: {
			id: true,
			createdAt: true,
			stoppedAt: true,
			routine: {
				select: {
					id: true,
					name: true,
					description: true,
					videoUrl: true,
					type: true,
				},
			},
		},
		where: {
			id: params.workoutId,
			AND: [{ ownerId: userId }, { deleted: false }],
		},
	})
	invariantResponse(workout, 'Not found', { status: 404 })
	return json({ workout })
}

export default function WorkoutEdit() {
	const data = useLoaderData<typeof loader>()

	return <WorkoutEditor workout={data.workout} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No workout with the id "{params.workoutId}" exists</p>
				),
			}}
		/>
	)
}
