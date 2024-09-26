import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { RoutineEditor } from './__routine-editor.tsx'

export { action } from './__routine-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const routine = await prisma.routine.findFirst({
		select: {
			id: true,
			name: true,
			description: true,
			videoUrl: true,
			type: true,
		},
		where: {
			id: params.routineId,
			OR: [{ ownerId: userId }, { ownerId: null }],
		},
	})
	invariantResponse(routine, 'Not found', { status: 404 })
	return json({ routine })
}

export default function RoutineEdit() {
	const data = useLoaderData<typeof loader>()

	return <RoutineEditor routine={data.routine} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No routine with the id "{params.routineId}" exists</p>
				),
			}}
		/>
	)
}
