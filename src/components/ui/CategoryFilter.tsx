// components/ui/CategoryFilter.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type JobCategory = {
  id: string;
  name: string;
};

// Terima daftar kategori sebagai props
interface CategoryFilterProps {
  categories: JobCategory[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Ambil kategori dari URL saat komponen dimuat
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Efek ini akan berjalan setiap kali kategori diubah
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Jika memilih "Semua Kategori", hapus parameter dari URL
    if (selectedCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', selectedCategory);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [selectedCategory, pathname, router, searchParams]);

  return (
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full rounded-md border-gray-300 p-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-72"
    >
      <option value="all">Semua Kategori</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}