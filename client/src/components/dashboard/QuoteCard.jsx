import Panel from './Panel'

export default function QuoteCard({ quote }) {
  return (
    <Panel label="Thought for Today" className="lg:col-span-4">
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 pt-3 sm:grid-cols-12 sm:gap-4">

        <figure className="flex flex-col justify-start sm:col-span-7 lg:col-span-7">
          <div className="pt-6">
            <blockquote className="text-base leading-relaxed text-fg sm:text-lg lg:text-2xl">
              {quote.text}
            </blockquote>
            {quote.author && (
              <figcaption className="text-primary-600 text-sm sm:text-base font-medium mt-14">
                - {quote.author}
              </figcaption>
            )}
          </div>
        </figure>

        <figure className="flex items-end justify-end sm:col-span-5 lg:col-span-5">
          <img
            src="/quote.webp"
            className="max-w-56 w-full object-contain sm:max-w-[18rem] lg:max-w-[24rem] xl:max-w-md"
          />
        </figure>

      </div>
    </Panel>
  );
}