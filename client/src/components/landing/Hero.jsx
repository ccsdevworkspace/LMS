export default function Hero({ openModal }) {
  return (
    <main className="flex flex-col min-h-screen font-sans text-fg bg-app relative">
      {/* split background */}
      <div className="flex flex-col lg:flex-row absolute inset-0 pointer-events-none">
        <div className="bg-surface w-full lg:w-1/2"></div>
        <div className="bg-soft/75 w-full lg:w-1/2"></div>
      </div>

      <section className="relative z-10 flex-1 flex flex-col justify-start pt-8 sm:pt-8 md:pt-20 lg:pt-45 pointer-events-none">
        <div className="flex flex-col lg:flex-row w-full items-stretch">
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end px-8 sm:px-16 lg:px-24 pointer-events-auto">
            <div className="max-w-135 w-full flex flex-col justify-center mr-10">
              
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-600 font-semibold px-6 py-2 mb-8 text-[15px] rounded w-fit">
                <img src="/logo.webp" className="h-5" />
                App
              </div>
              
              <h1 className="text-5xl lg:text-[64px] font-bold tracking-tight text-fg mb-6 leading-[1.1]">
                Learning Without<br />
                <span className="text-primary-600">Boundaries.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-fg-muted mb-12 leading-relaxed max-w-125">
                Connect teachers and students through one workspace. Beyond the classroom.
              </p>
              
              <div>
                <button 
                  onClick={openModal}
                  className="bg-btn hover:bg-btn-hover text-fg-inverse font-semibold text-base px-10 py-4 rounded-md transition-colors w-fit cursor-pointer"
                >
                  Get Started
                </button>
              </div>
              
            </div>
          </div>
          
          <figure className="flex justify-center lg:justify-start w-full lg:w-1/2 px-8 sm:px-16 lg:px-24 mt-16 lg:mt-0 pointer-events-auto">
            <img src="/landing.webp" alt="Landing" className="max-w-190 w-full self-stretch object-contain" />
          </figure>

        </div>
      </section>

      <footer className="flex flex-col lg:flex-row  relative lg:absolute lg:bottom-16 inset-x-0 z-10 pb-8 lg:pb-0 pointer-events-none">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end px-8 sm:px-16 lg:px-24 pointer-events-auto">
          <div className="max-w-135 w-full text-left text-[13px] text-fg-subtle font-medium mr-10">
             © {new Date().getFullYear()} B App. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
