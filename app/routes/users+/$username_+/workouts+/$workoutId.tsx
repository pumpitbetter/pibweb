import { getFormProps, useForm } from '@conform-to/react'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
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
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { actionDelete, actionStop } from './__workout-server.tsx'
import { type loader as workoutsLoader } from './_layout.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const workout = await prisma.workout.findUnique({
		where: { id: params.workoutId },
		select: {
			id: true,
			createdAt: true,
			stoppedAt: true,
			ownerId: true,
			updatedAt: true,
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
	})

	invariantResponse(workout, 'Not found', { status: 404 })

	const date = new Date(workout.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		workout,
		timeAgo,
	})
}

export async function action(args: ActionFunctionArgs) {
	const { request, params } = args

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case 'delete-workout':
			return actionDelete({ request, params, formData })
		case 'stop-workout':
			return actionStop({ request, params, formData })
	}
}

export default function WorkoutRoute() {
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const user = useOptionalUser()
	const isOwner = user?.id && user?.id === data.workout?.ownerId
	const isActive = data.workout.stoppedAt !== null
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:workout:own` : `delete:workout:any`,
	)
	const displayBar = canDelete || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<div className="py-7">
				<Link
					prefetch="intent"
					to={`/users/${params?.username}/workouts`}
					className="md:hidden"
				>
					<Icon className="text-body-md" name="arrow-left">
						All workouts
					</Icon>
				</Link>
			</div>
			<h2 className="mb-2 text-h2 lg:mb-6">{data.workout.routine.name}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<p className="whitespace-break-spaces pb-8 text-sm md:text-lg">
					<strong>Type: </strong>
					{data.workout.routine.type.name}
				</p>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.workout.routine.description}
				</p>
				{data.workout.routine.videoUrl && (
					<iframe
						src={data.workout.routine.videoUrl}
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
						className="mt-8 aspect-video w-full"
					></iframe>
				)}
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{isActive && canDelete ? (
							<DeleteWorkout id={data.workout.id} />
						) : null}
						{isActive && (
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
						)}
						{!isActive && <StopWorkout id={data.workout.id} />}
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteWorkout({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-workout',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="workoutId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-workout"
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

export function StopWorkout({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'stop-workout',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="workoutId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="stop-workout"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				x
				<Icon name="pencil-1" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Stop</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/workout': typeof workoutsLoader }
> = ({ data, params, matches }) => {
	const workoutsMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/workout',
	)
	const displayName = workoutsMatch?.data?.owner.name ?? params.username
	const workoutName = data?.workout?.routine.name ?? 'Workout'
	const workoutDescriptionSummary =
		data?.workout?.routine?.description &&
		data.workout?.routine?.description?.length > 100
			? data?.workout?.routine.description?.slice(0, 97) + '...'
			: 'No content'
	return [
		{ title: `${workoutName} | ${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: workoutDescriptionSummary,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No workout with the id "{params.workoutId}" exists</p>
				),
			}}
		/>
	)
}
