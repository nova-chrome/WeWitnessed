import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { ManageDashboard } from "./_components/manage-dashboard";

interface ManagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ManagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchQuery(api.events.getOgData, { slug });

  if (!event) {
    return { title: "Event Not Found | WeWitnessed" };
  }

  return {
    title: `Manage ${event.name} | WeWitnessed`,
  };
}

export default async function ManagePage({ params }: ManagePageProps) {
  const { slug } = await params;

  return <ManageDashboard slug={slug} />;
}
