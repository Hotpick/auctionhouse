import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { auctions } from "./data";
import { AuctionDetail, AuctionHome } from "./ui";
import "./index.css";

function AuctionPage() {
  const { id } = useParams();
  const auction = auctions.find((item) => item.id === id);
  if (!auction) return <Navigate to="/" replace />;
  return <AuctionDetail key={auction.id} auction={auction} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuctionHome />} />
        <Route path="/auction/:id" element={<AuctionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
