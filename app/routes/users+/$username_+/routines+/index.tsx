import { type MetaFunction } from '@remix-run/react'
import { type loader as routinesLoader } from './_layout.tsx'

export default function RoutinesIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a routine</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/routines': typeof routinesLoader }
> = ({ params, matches }) => {
	const routinesMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/routines',
	)
	const displayName = routinesMatch?.data?.owner.name ?? params.username
	const routinesCount = routinesMatch?.data?.owner.routines.length ?? 0
	const routinesText = routinesCount === 1 ? 'routine' : 'routines'
	return [
		{ title: `${displayName}'s Routines | Pump It Better` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${routinesCount} ${routinesText} on Epic Notes`,
		},
	]
}
