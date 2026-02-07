export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="relative min-h-svh bg-neutral-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-neutral-950 to-black pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center min-h-svh px-6">
        <div className="text-5xl font-light text-neutral-100 tracking-tight mb-8">
          W
        </div>
        <p className="text-neutral-400 text-center text-sm tracking-wide">
          Gallery for <span className="text-neutral-200">{slug}</span> — coming
          soon.
        </p>
      </div>
    </div>
  );
}
