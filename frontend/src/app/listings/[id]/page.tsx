'use client';

import { ListingDetailPage } from '../../../pages/ListingDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetail({ params }: Props) {
  const { id } = await params;
  return <ListingDetailPage listingId={id} />;
}