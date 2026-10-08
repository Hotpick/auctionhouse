"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Clock3, Gavel, Heart, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { auctions, money, type Auction } from "./data";

type Theme = "gallery" | "terminal" | "editorial";
const themes: { id: Theme; name: string; note: string }[] = [
  { id: "gallery", name: "Gallery", note: "Quiet & refined" },
  { id: "terminal", name: "Market", note: "Dense & precise" },
  { id: "editorial", name: "Editorial", note: "Bold & expressive" },
];

function useTheme() {
  const [theme, setTheme] = useState<Theme>("gallery");
  useEffect(() => {
    const saved = window.localStorage.getItem("gavel-theme") as Theme | null;
    if (saved && themes.some((item) => item.id === saved)) setTheme(saved);
  }, []);
  const choose = (next: Theme) => {
    setTheme(next);
    window.localStorage.setItem("gavel-theme", next);
  };
  return { theme, choose };
}

function Brand() {
  return <Link href="/" className="brand" aria-label="Gavel House home"><span className="brand-mark"><Gavel size={18} /></span><span>Gavel House</span></Link>;
}

function ThemeSwitch({ theme, choose }: { theme: Theme; choose: (theme: Theme) => void }) {
  return (
    <div className="theme-switch" aria-label="Choose visual theme">
      {themes.map((item) => <button key={item.id} className={theme === item.id ? "active" : ""} onClick={() => choose(item.id)} aria-pressed={theme === item.id}><span>{item.name}</span><small>{item.note}</small></button>)}
    </div>
  );
}

function SiteHeader({ theme, choose }: { theme: Theme; choose: (theme: Theme) => void }) {
  return <><div className="notice"><Sparkles size={14} /> Curated auctions, selected weekly <span>Buyer protection on every lot</span></div><header><Brand /><ThemeSwitch theme={theme} choose={choose} /><button className="outline-btn">Sign in</button></header></>;
}

function AuctionCard({ item, index }: { item: Auction; index: number }) {
  return (
    <Link href={`/auction/${item.id}`} className={`auction-card card-${index + 1}`}>
      <div className="image-wrap"><img src={item.image} alt={item.title} /><span className="lot-tag">{item.lot}</span><button className="heart" aria-label={`Save ${item.title}`} onClick={(e) => e.preventDefault()}><Heart size={18} /></button></div>
      <div className="card-body"><div className="card-meta"><span>{item.category}</span><span><Clock3 size={13} /> {item.timeLeft}</span></div><h3>{item.title}</h3><p>{item.maker}</p><div className="bid-line"><div><small>Current bid</small><strong>{money(item.currentBid)}</strong></div><span>{item.bids} bids <ChevronRight size={16} /></span></div></div>
    </Link>
  );
}

export function AuctionHome() {
  const { theme, choose } = useTheme();
  return (
    <main data-theme={theme}>
      <SiteHeader theme={theme} choose={choose} />
      <section className="intro"><div><p className="eyebrow">LIVE NOW · 6 LOTS</p><h1>Objects worth<br />the pursuit.</h1></div><div className="intro-copy"><p>Exceptional design, art, and curiosities—carefully sourced and ready for your bid.</p><div className="live-dot"><i /> Live auction · Lots closing soon</div></div></section>
      <section className="auction-section"><div className="section-title"><h2>Closing soon</h2><p>All times shown in your local timezone</p></div><div className="auction-grid">{auctions.map((item, index) => <AuctionCard key={item.id} item={item} index={index} />)}</div></section>
      <footer><Brand /><p>Sample auction experience · All lots are fictional.</p><span>© 2026 Gavel House</span></footer>
    </main>
  );
}

export function AuctionDetail({ auction }: { auction: Auction }) {
  const { theme, choose } = useTheme();
  const [bid, setBid] = useState(auction.currentBid + 250);
  const [placed, setPlaced] = useState(false);
  const minimum = auction.currentBid + 250;
  const suggestions = useMemo(() => [minimum, minimum + 250, minimum + 750], [minimum]);
  const placeBid = () => { setPlaced(true); window.setTimeout(() => setPlaced(false), 3200); };
  useEffect(() => {
    type WebMCPContext = { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> };
    const context = (document as Document & { modelContext?: WebMCPContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: "stage_auction_bid",
      title: "Prepare an auction bid",
      description: "Set a bid amount in the visible form for the current auction lot without submitting it.",
      inputSchema: { type: "object", properties: { amount: { type: "number", minimum } }, required: ["amount"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const amount = (input as { amount?: unknown })?.amount;
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount < minimum) throw new Error(`Bid must be at least ${minimum} USD.`);
        const rounded = Math.round(amount);
        setBid(rounded);
        return { lot: auction.id, stagedBid: rounded, currency: "USD", submitted: false };
      },
    };
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* unsupported preview implementation */ }
    return () => lifecycle.abort();
  }, [auction.id, minimum]);
  return (
    <main data-theme={theme}>
      <SiteHeader theme={theme} choose={choose} />
      <div className="detail-top"><Link href="/" className="back-link"><ArrowLeft size={17} /> All auctions</Link><span>{auction.lot}</span></div>
      <section className="detail-layout">
        <div className="detail-visual"><img src={auction.image} alt={auction.title} /><div className="image-count">01 / 04</div></div>
        <div className="detail-info"><p className="eyebrow">{auction.category} · {auction.lot}</p><h1>{auction.title}</h1><p className="maker">{auction.maker}</p><p className="description">{auction.description}</p><div className="location"><MapPin size={16} /> {auction.location}</div><div className="facts">{auction.details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
        <aside className="bid-panel"><div className="countdown"><span><Clock3 size={15} /> Time left</span><strong>{auction.timeLeft}</strong><small>Ends {auction.ends}</small></div><div className="current"><span>Current bid</span><strong>{money(auction.currentBid)}</strong><small>{auction.bids} bids · Reserve met</small></div><label htmlFor="bid">Your bid</label><div className="bid-input"><span>$</span><input id="bid" inputMode="numeric" value={bid} onChange={(e) => setBid(Number(e.target.value.replace(/\D/g, "")))} /><span>USD</span></div><div className="quick-bids">{suggestions.map((value) => <button key={value} onClick={() => setBid(value)}>{money(value)}</button>)}</div><button className="bid-button" onClick={placeBid}>Place bid</button><p className="fine-print"><ShieldCheck size={16} /> By bidding, you agree to the auction terms. No charge is made unless you win.</p></aside>
      </section>
      <section className="provenance"><div><p className="eyebrow">SPECIALIST’S NOTE</p><h2>Made to be lived with.</h2></div><p>Selected for its design integrity, strong provenance, and honest condition. This lot has been reviewed by our specialist team and is offered with a 14-day authenticity guarantee.</p></section>
      {placed && <div className="toast" role="status"><Gavel size={18} /><div><strong>Your bid is ready</strong><span>This prototype doesn’t submit real bids.</span></div></div>}
      <footer><Brand /><p>Sample auction experience · All lots are fictional.</p><span>© 2026 Gavel House</span></footer>
    </main>
  );
}
