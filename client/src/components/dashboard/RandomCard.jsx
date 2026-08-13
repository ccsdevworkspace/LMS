import { Link } from 'react-router-dom'
import Panel from './Panel'

export default function RandomCard() {
  return (
    <Panel label="Today's Focus" className="flex flex-col lg:col-span-3">
      <div className="flex flex-1 flex-col justify-start px-6 pb-6 pt-6 sm:flex-row sm:justify-between">
        
        <div className="flex flex-1 flex-col">
          <div>
            <h3 className="mb-1 text-lg font-bold text-fg sm:text-3xl">
              Ready to get started?
            </h3>

            <p className="text-xs leading-5 text-fg-subtle sm:text-base">
              Everything you need is organized in one workspace.
            </p>
          </div>

          <div className="mt-auto pt-6">
            <Link
              to="/courses"
              className="flex items-center justify-center rounded-md w-full h-12 border border-border bg-btn px-6 text-sm font-medium text-fg-inverse transition hover:border-border-hover hover:bg-btn-hover dark:text-fg sm:w-52 lg:mb-6"
            >
              Continue
            </Link>
          </div>
        </div>

        <figure className="self-center">
          <img
            src="/greenbook.webp"
            className="hidden sm:block h-40 w-auto object-contain"
          />
        </figure>

      </div>
    </Panel>
  )
}