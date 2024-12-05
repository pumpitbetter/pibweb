import { Card, CardContent } from '#app/components/ui/card.tsx'
import { type CircuitExerciseInfo } from './$routineId'

export function ExerciseListItem({
	circuitExercise,
}: {
	circuitExercise: CircuitExerciseInfo
}) {
	return (
		<Card>
			<CardContent className="p-2">{circuitExercise.exercise.name}</CardContent>
		</Card>
	)
}
