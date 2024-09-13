import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server.ts'
import { ExerciseEditor } from './__exercise-editor.tsx'

export { action } from './__exercise-editor.server.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return json({})
}

export default ExerciseEditor
