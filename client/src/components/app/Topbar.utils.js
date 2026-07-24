export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Courses',   path: '/courses' },
  { label: 'To-Do',     path: '/todo' },
  { label: 'Calendar',  path: '/calendar' },
  { label: 'Chat',      path: '/chat' },
]

export function Avatar({ profile }) {
  return (
    <div className="w-9 h-9 md:w-12 md:h-12 rounded-full overflow-hidden bg-muted shrink-0">
      {profile?.avatarUrl
        ? <img src={profile.avatarUrl} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-fg-subtle text-sm font-medium">{profile?.fullName?.[0] ?? '?'}</div>
      }
    </div>
  )
}

export const btnClass = 'flex items-center justify-center rounded-full border border-border text-fg-subtle hover:text-fg-muted hover:border-border-hover transition-colors cursor-pointer'
