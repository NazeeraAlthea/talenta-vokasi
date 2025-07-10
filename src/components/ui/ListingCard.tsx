import Link from 'next/link';
import Image from 'next/image';

type Listing = {
  id: string;
  title: string;
  location: string;
  companies: { name: string; logo_url: string | null; } | null;
};

// Terima prop baru: 'actionSlot' yang merupakan elemen React
type ListingCardProps = {
  listing: Listing;
  actionSlot: React.ReactNode; 
};

export default function ListingCard({ listing, actionSlot }: ListingCardProps) {
  const companyName = listing.companies?.name || 'Perusahaan';
  const initial = companyName.charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {listing.companies?.logo_url ? <Image width={48} height={48} className="h-12 w-12 rounded-full object-cover" src={listing.companies.logo_url} alt={`${companyName} logo`} /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">{initial}</div>}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600"><Link href={`/lowongan/${listing.id}`}>{listing.title}</Link></h3>
            <p className="text-sm font-medium text-gray-700">{companyName}</p>
            <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
          </div>
        </div>
      </div>
      {/* Tampilkan tombol aksi apa pun yang dikirim */}
      <div className="mt-5 flex items-center justify-end">
        {actionSlot}
      </div>
    </div>
  );
}