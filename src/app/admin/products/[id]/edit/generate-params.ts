// This file provides generateStaticParams for the edit page
// Since the page.tsx uses "use client", we need this separate server component

export async function generateStaticParams() {
  // For admin routes with dynamic IDs, return empty array 
  // This allows Next.js to handle dynamic routes during static export
  return [];
}

// Re-export for the page
export { generateStaticParams as default };
