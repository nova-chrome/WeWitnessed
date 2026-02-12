import { Fragment, PropsWithChildren } from "react";
import { EventPWARegister } from "~/components/event-pwa-register";

interface EventLayoutProps {
  params: Promise<{ slug: string }>;
}

export default async function EventLayout({
  params,
  children,
}: PropsWithChildren<EventLayoutProps>) {
  const { slug } = await params;

  return (
    <Fragment>
      <EventPWARegister slug={slug} />
      {children}
    </Fragment>
  );
}
