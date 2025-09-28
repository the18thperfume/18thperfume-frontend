// Frontend types - sao chép từ backend để đảm bảo tách biệt
export interface Product {
  productId: string;
  name: string;
  description: string;
  brand: string;
  category: string; // Nam, Nữ, Unisex  
  segment: string; // Designer, Niche
  origin: string;
  fragranceFamily: string; // Nhóm hương
  concentration: string; // Nồng độ
  releaseYear: number;
  seasons: string[]; // Xuân, Hè, Thu, Đông
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  ingredients: string[]; // Auto-generated từ notes
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  variantName: string; // "Chiết 10ml", "Fullseal 50ml"
  size: string;
  originalPrice: number;
  salePercentage: number; // 0-100
  finalPrice: number; // Calculated
  capacity: string; // Auto-extracted: "Chiết", "Fullseal" 
  stock: number;
  imageUrl: string;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  category: string;
  segment: string;
  origin: string;
  fragranceFamily: string;
  concentration: string;
  releaseYear: number;
  seasons: string[];
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  variants: VariantFormData[];
}

export interface VariantFormData {
  variantName: string;
  size: string;
  originalPrice: number;
  salePercentage: number;
  stock: number;
  imageUrl?: string;
}

export interface APIResponse<T = unknown> {
  statusCode: number;
  data?: T;
  message?: string;
  error?: string;
}
