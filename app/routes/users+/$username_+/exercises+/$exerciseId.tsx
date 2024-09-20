import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
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
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { type loader as exercisesLoader } from './_layout.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const exercise = await prisma.exercise.findUnique({
		where: { id: params.exerciseId },
		select: {
			id: true,
			name: true,
			description: true,
			type: true,
			ownerId: true,
			updatedAt: true,
		},
	})

	invariantResponse(exercise, 'Not found', { status: 404 })

	const date = new Date(exercise.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		exercise,
		timeAgo,
	})
}

const DeleteFormSchema = z.object({
	intent: z.literal('delete-exercise'),
	exerciseId: z.string(),
})

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { exerciseId } = submission.value

	const exercise = await prisma.exercise.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		where: { id: exerciseId },
	})
	invariantResponse(exercise, 'Not found', { status: 404 })

	const isOwner = exercise?.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:exercise:own` : `delete:exercise:any`,
	)

	await prisma.exercise.delete({ where: { id: exercise.id } })

	return redirectWithToast(`/users/${params?.username}/exercises`, {
		type: 'success',
		title: 'Success',
		description: 'Your exercise has been deleted.',
	})
}

export default function ExerciseRoute() {
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const user = useOptionalUser()
	const isOwner = user?.id && user?.id === data.exercise?.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:exercise:own` : `delete:exercise:any`,
	)
	const displayBar = canDelete || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<div className="py-7">
				<Link
					prefetch="intent"
					to={`/users/${params?.username}/exercises`}
					className="md:hidden"
				>
					<Icon className="text-body-md" name="arrow-left">
						All exercises
					</Icon>
				</Link>
			</div>
			<h2 className="mb-2 text-h2 lg:mb-6">{data.exercise.name}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<p className="whitespace-break-spaces pb-8 text-sm md:text-lg">
					<strong>Type: </strong>
					{data.exercise.type.name}
				</p>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.exercise.description}
				</p>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteExercise id={data.exercise.id} /> : null}
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
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteExercise({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-exercise',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="exerciseId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-exercise"
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

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/exercises': typeof exercisesLoader }
> = ({ data, params, matches }) => {
	const exercisesMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/exercises',
	)
	const displayName = exercisesMatch?.data?.owner.name ?? params.username
	const exerciseName = data?.exercise.name ?? 'Exercise'
	const exerciseDescriptionSummary =
		data?.exercise?.description && data.exercise?.description?.length > 100
			? data?.exercise.description?.slice(0, 97) + '...'
			: 'No content'
	return [
		{ title: `${exerciseName} | ${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: exerciseDescriptionSummary,
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
