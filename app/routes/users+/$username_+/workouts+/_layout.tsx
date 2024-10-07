import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
	Link,
	NavLink,
	Outlet,
	useLoaderData,
	useParams,
} from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser } from '#app/utils/user.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const owner = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
		},
		where: { username: params.username },
	})

	const workouts = await prisma.workout.findMany({
		select: {
			id: true,
			routine: {
				select: { id: true, name: true },
			},
			createdAt: true,
		},
		where: { AND: [{ ownerId: owner?.id }, { deleted: false }] },
	})

	invariantResponse(owner, 'Owner not found', { status: 404 })

	return json({ owner: { ...owner, workouts } })
}

/*
if url matches workout detail (if it includes workout id)
show master view only on screens bigger then mobile
*/
export default function WorkoutsRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const params = useParams()
	const hasDetails = Boolean(params?.workoutId)
	const isOwner = user?.id === data.owner.id
	const ownerDisplayName = data.owner.name ?? data.owner.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<main className="container flex h-full min-h-[400px] px-0 pb-12 md:px-8">
			<div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:rounded-3xl md:pr-0">
				{/* master view: hidden on mobile if url includes routineId */}
				<div
					className={cn(
						'relative col-span-4 md:col-span-1',
						hasDetails && 'hidden md:block',
					)}
				>
					<div className="absolute inset-0 flex flex-col">
						<Link
							to={`/users/${data.owner.username}`}
							className="flex flex-col items-center justify-center gap-2 bg-muted pb-4 pl-8 pr-4 pt-12 lg:flex-row lg:justify-start lg:gap-4"
						>
							<img
								src={getUserImgSrc(data.owner.image?.id)}
								alt={ownerDisplayName}
								className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
							/>
							<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{ownerDisplayName}'s Workouts
							</h1>
						</Link>
						<ul className="overflow-y-auto overflow-x-hidden pb-12">
 
							{data.owner.workouts.map((workout) => (
								<li key={workout.id} className="p-1 pr-0">
									<NavLink
										to={workout.id}
										preventScrollReset
										prefetch="intent"
										className={({ isActive }) =>
											cn(navLinkDefaultClassName, isActive && 'bg-accent')
										}
									>
										<h4>{workout.routine.name}</h4>
										{workout.createdAt}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* outlet for detail view: hidden on mobile if url does NOT include routineId */}
				<div
					className={cn(
						'relative col-span-4 bg-accent md:col-span-3 md:rounded-r-3xl',
						!hasDetails && 'hidden md:block',
					)}
				>
					<Outlet />
				</div>
			</div>
		</main>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
