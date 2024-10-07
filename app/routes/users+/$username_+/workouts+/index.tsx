import { type MetaFunction } from '@remix-run/react'
import { type loader as workoutsLoader } from './_layout.tsx'

export default function WorkoutsIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a workout</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/workouts': typeof workoutsLoader }
> = ({ params, matches }) => {
	const workoutsMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/workouts',
	)
	const displayName = workoutsMatch?.data?.owner.name ?? params.username
	const workoutsCount = workoutsMatch?.data?.owner.workouts.length ?? 0
	const workoutsText = workoutsCount === 1 ? 'workout' : 'workouts'
	return [
		{ title: `${displayName}'s Workouts | Pump It Better` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${workoutsCount} ${workoutsText} on Epic Notes`,
		},
	]
}
