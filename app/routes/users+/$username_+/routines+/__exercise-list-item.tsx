import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '#app/components/ui/card.tsx'
import { type CircuitExerciseInfo } from './$routineId'

export function ExerciseListItem({
	circuitExercise,
}: {
	circuitExercise: CircuitExerciseInfo
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: circuitExercise.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<CardContent className="p-2">{circuitExercise.exercise.name}</CardContent>
		</Card>
	)
}
