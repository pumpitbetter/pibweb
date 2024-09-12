import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { ExerciseEditor } from './__exercise-editor.tsx'

export { action } from './__exercise-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const exercise = await prisma.exercise.findFirst({
		select: {
			id: true,
			name: true,
			description: true,
		},
		where: {
			id: params.exerciseId,
			OR: [{ ownerId: userId }, { ownerId: null }],
		},
	})
	invariantResponse(exercise, 'Not found', { status: 404 })
	return json({ exercise })
}

export default function ExerciseEdit() {
	const data = useLoaderData<typeof loader>()

	return <ExerciseEditor exercise={data.exercise} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No exercise with the id "{params.exerciseId}" exists</p>
				),
			}}
		/>
	)
}
