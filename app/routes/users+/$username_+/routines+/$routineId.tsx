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
import { type loader as routinesLoader } from './_layout.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const routine = await prisma.routine.findUnique({
		where: { id: params.routineId },
		select: {
			id: true,
			name: true,
			description: true,
			videoUrl: true,
			type: true,
			ownerId: true,
			updatedAt: true,
		},
	})

	invariantResponse(routine, 'Not found', { status: 404 })

	const date = new Date(routine.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		routine,
		timeAgo,
	})
}

const DeleteFormSchema = z.object({
	intent: z.literal('delete-routine'),
	routineId: z.string(),
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

export default function RoutineRoute() {
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const user = useOptionalUser()
	const isOwner = user?.id && user?.id === data.routine?.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:routine:own` : `delete:routine:any`,
	)
	const displayBar = canDelete || isOwner

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
			<h2 className="mb-2 text-h2 lg:mb-6">{data.routine.name}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<p className="whitespace-break-spaces pb-8 text-sm md:text-lg">
					<strong>Type: </strong>
					{data.routine.type.name}
				</p>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.routine.description}
				</p>
				{data.routine.videoUrl && (
					<iframe
						width="560"
						height="315"
						src={data.routine.videoUrl}
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerpolicy="strict-origin-when-cross-origin"
						allowfullscreen
						className="mt-8"
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
						{canDelete ? <DeleteRoutine id={data.routine.id} /> : null}
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

export function DeleteRoutine({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
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

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/routine': typeof routinesLoader }
> = ({ data, params, matches }) => {
	const routinesMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/routine',
	)
	const displayName = routinesMatch?.data?.owner.name ?? params.username
	const routineName = data?.routine.name ?? 'Routine'
	const routineDescriptionSummary =
		data?.routine?.description && data.routine?.description?.length > 100
			? data?.routine.description?.slice(0, 97) + '...'
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
