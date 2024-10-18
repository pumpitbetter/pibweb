import { type Exercise } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Copy } from 'lucide-react'
import { Button } from './ui/button'
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'

function ExercisePickerDialog({
	routineId,
	exercises,
	// selectedExercises,
	// setSelectedExercises,
}: {
	routineId: string | undefined,
	exercises: SerializeFrom<Pick<Exercise, 'id' | 'name'>[]> | undefined

	// selectedExercises: any[]z
	// setSelectedExercises: any[]
}) {
	return (
		<Dialog
			onOpenChange={(open: boolean) => {
				if (open) {
					// todo: clear selected exercise state
				} else {
					console.log('closing exercise picker dialog')
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline">Add exercises</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add exercises</DialogTitle>
					<DialogDescription>
						Select exercises to add to your routine.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center space-x-2">
					<ul className="grid flex-1 gap-2">
						{exercises &&
							exercises.map((exercise) => (
								<li key={exercise.id} className="items-top flex space-x-2">
									<Checkbox id={exercise.id} />
									<div className="grid gap-1.5 leading-none">
										<label
											htmlFor={exercise.id}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{exercise.name}
										</label>
									</div>
								</li>
							))}
					</ul>
				</div>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
					<Button type="button" variant="default">
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export { ExercisePickerDialog }
