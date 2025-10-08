import EditProductClient from './edit-client';

// Generate static params for static export
export async function generateStaticParams() {
  // For admin routes, return empty array to allow dynamic routing
  return [];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <EditProductClient params={params} />;
}
