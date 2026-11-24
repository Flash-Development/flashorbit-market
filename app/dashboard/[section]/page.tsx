import { notFound } from "next/navigation";

const placeholders = new Set([
  "products",
  "inventory",
  "orders",
  "customers",
  "finance",
  "team",
  "settings",
  "help",
]);

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!placeholders.has(section)) notFound();
  const title = section.charAt(0).toUpperCase() + section.slice(1);
  return (
    <div className="app-placeholder">
      <span className="app-eyebrow">{title}</span>
      <h1>{title}</h1>
      <div className="app-empty-state">
        <span>Coming next</span>
        <h2>{title} workspace</h2>
        <p>This section is part of the Flash foundation but its business functionality is not included in this milestone.</p>
      </div>
    </div>
  );
}
