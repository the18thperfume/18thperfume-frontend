// Layout for dynamic product routes
export async function generateStaticParams() {
  // Return empty array to allow dynamic routes in static export
  return [];
}

export default function ProductIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
