import { type PropsWithChildren } from 'react'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { type CircuitExerciseInfo } from './$routineId'
import { ExerciseListItem } from './__exercise-list-item'
import { useSortable } from '@dnd-kit/sortable'

export function CircuitCard({
	id,
	circuitExercises,
	children,
}: PropsWithChildren<{
	id: string,
	circuitExercises: CircuitExerciseInfo[] | undefined
}>) {
	return (
		<Card className="bg-muted">
			<CardContent className="p-2">
				<ul>
					{circuitExercises?.map((circuitExercise) => (
						<li className="w-full pb-2" key={circuitExercise.exercise.id}>
							<ExerciseListItem circuitExercise={circuitExercise} />
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="flex justify-between">{children}</CardFooter>
		</Card>
	)
}
