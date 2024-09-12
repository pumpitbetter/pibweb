import { type MetaFunction } from '@remix-run/react'
import { type loader as exercisesLoader } from './_layout.tsx'

export default function ExercisesIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select an exercise</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/exercises': typeof exercisesLoader }
> = ({ params, matches }) => {
	const exercisesMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/exercises',
	)
	const displayName = exercisesMatch?.data?.owner.name ?? params.username
	const exerciseCount = exercisesMatch?.data?.owner.exercises.length ?? 0
	const exercisesText = exerciseCount === 1 ? 'exercise' : 'exercisess'
	return [
		{ title: `${displayName}'s Exercises | Pump It Better` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${exerciseCount} ${exercisesText} on Epic Notes`,
		},
	]
}
