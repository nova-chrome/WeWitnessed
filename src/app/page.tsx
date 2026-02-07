import { EventCreateForm } from "~/features/events/components/event-create-form";

export default function Home() {
  return (
    <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
      {/* Elegant grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

      {/* Thin accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-between min-h-svh px-6 py-16">
        {/* Top section */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl">
          {/* Monogram */}
          <div className="mb-12 relative">
            <div className="text-7xl font-light text-neutral-100 tracking-tight">
              W
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extralight text-neutral-100 text-center mb-6 tracking-wide">
            WeWitnessed
          </h1>

          {/* Subtitle */}
          <p className="text-base text-neutral-400 text-center mb-16 max-w-sm leading-relaxed font-light tracking-wide">
            Capture the moments that matter.
            <br />
            Create your event, share the QR, and let guests upload photos.
          </p>

          {/* Event creation form */}
          <EventCreateForm />
        </div>

        {/* Bottom accent */}
        <div className="flex items-center gap-6 text-neutral-600 text-xs tracking-widest uppercase mt-12">
          <div className="w-8 h-px bg-neutral-800" />
          <span>Timeless</span>
          <span className="text-neutral-800">&middot;</span>
          <span>Elegant</span>
          <span className="text-neutral-800">&middot;</span>
          <span>Memorable</span>
          <div className="w-8 h-px bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
