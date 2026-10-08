import { notFound } from "next/navigation";
import { auctions } from "../../data";
import { AuctionDetail } from "../../ui";

export function generateStaticParams() { return auctions.map((auction) => ({ id: auction.id })); }

export default async function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = auctions.find((item) => item.id === id);
  if (!auction) notFound();
  return <AuctionDetail auction={auction} />;
}
