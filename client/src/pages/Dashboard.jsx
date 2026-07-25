import { useUserStore } from '../stores/user'

export default function Dashboard() {
  const profile = useUserStore((state) => state.profile)

  return (
    <main className="p-8">
      {profile && (
        <h1 className="text-2xl">
          Welcome, {profile.fullName}!
        </h1>
      )}
    </main>
  )
}
