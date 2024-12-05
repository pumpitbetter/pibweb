import { getFormProps, useForm } from '@conform-to/react'
import { invariantResponse } from '@epic-web/invariant'
import { type CircuitExercise, type Exercise } from '@prisma/client'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type SerializeFrom,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useParams,
	type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { actionDelete, actionStart } from './__routineId.server.tsx'
import { type loader as routinesLoader } from './_layout.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const routine = await prisma.routine?.findUnique({
		where: { id: params.routineId },
		select: {
			id: true,
			name: true,
			description: true,
			videoUrl: true,
			type: true,
			ownerId: true,
			updatedAt: true,
			circuits: {
				select: {
					id: true,
					sequence: true,
				},
				orderBy: { sequence: 'asc' },
			},
			circuitExercises: {
				select: {
					id: true,
					circuitId: true,
					routineId: true,
					exercise: {
						select: {
							id: true,
							name: true,
						},
					},
					sequence: true,
				},
			},
		},
	})

	invariantResponse(routine, 'Not found', { status: 404 })

	const date = new Date(routine?.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		routine,
		timeAgo,
	})
}

export async function action(args: ActionFunctionArgs) {
	const { request, params } = args

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case 'delete-routine':
			return actionDelete({ request, params, formData })
		case 'start-routine':
			return actionStart({ request, params, formData })
	}
}

export type CircuitExerciseInfo = SerializeFrom<
	Pick<CircuitExercise, 'id' | 'sequence' | 'circuitId' | 'routineId'>
> & { exercise: SerializeFrom<Pick<Exercise, 'id' | 'name'>> }

export default function RoutineRoute() {
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const user = useOptionalUser()
	const isOwner = user?.id && user?.id === data.routine?.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:routine:own` : `delete:routine:any`,
	)
	const canStart = isOwner
	const displayBar = canDelete || isOwner

	let circuit = new Map<string, CircuitExerciseInfo[]>()
	for (let c of data.routine?.circuits) {
		circuit.set(
			c.id,
			data.routine?.circuitExercises
				?.filter((i) => i.circuitId === c.id) // filter out all exercises other then given `circuitId`
				.sort((i) => i.sequence), // sort asc within the above results
		)
	}
	const firstCircuitId = data.routine?.circuits?.[0]?.id || ''
	const firstCircuitExercises = circuit.get(firstCircuitId)

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<div className="py-7">
				<Link
					prefetch="intent"
					to={`/users/${params?.username}/routines`}
					className="md:hidden"
				>
					<Icon className="text-body-md" name="arrow-left">
						All routines
					</Icon>
				</Link>
			</div>
			<h2 className="mb-2 text-h2 lg:mb-6">{data.routine?.name}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<p className="whitespace-break-spaces pb-8 text-sm md:text-lg">
					<strong>Type: </strong>
					{data.routine?.type.name}
				</p>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.routine?.description}
				</p>
				{data.routine?.videoUrl && (
					<iframe
						src={data.routine?.videoUrl}
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
						className="mt-8 aspect-video w-full"
					></iframe>
				)}
				<h5 className="w-f whitespace-break-spaces py-4 text-h5">Exercises</h5>
				<ul>
					{firstCircuitExercises?.map((e) => (
						<li className="w-full p-2" key={e.exercise.id}>
							{e.exercise.name}
						</li>
					))}
				</ul>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteRoutine id={data.routine?.id} /> : null}
						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
						{canStart ? <StartRoutine id={data.routine?.id} /> : null}
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteRoutine({ id }: { id: string }) {
	const actionData = useActionData<typeof actionDelete>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-routine',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="routineId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-routine"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export function StartRoutine({ id }: { id: string }) {
	const actionData = useActionData<typeof actionStart>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'start-routine',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="routineId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="start-routine"
				variant="outline"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="clock" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Start</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/routine': typeof routinesLoader }
> = ({ data, params, matches }) => {
	const routinesMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/routine',
	)
	const displayName = routinesMatch?.data?.owner.name ?? params.username
	const routineName = data?.routine?.name ?? 'Routine'
	const routineDescriptionSummary =
		data?.routine?.description && data.routine?.description?.length > 100
			? data?.routine?.description?.slice(0, 97) + '...'
			: 'No content'
	return [
		{ title: `${routineName} | ${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: routineDescriptionSummary,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
