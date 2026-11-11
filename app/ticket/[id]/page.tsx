"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowDownToLine, ArrowLeft, CalendarDays, CheckCircle2, Clock3, Download, LoaderCircle, MapPin, ShieldCheck, TicketCheck } from "lucide-react";
import { API_URL } from "@/lib/constants";

type TicketInfo = { reference: string; fullName: string; email: string; phone: string; tickets: number; amount: number; ticketId: string; paymentStatus: string; checkedInAt: string | null; emailSent: boolean; gender: string; dressCode: string; qrCode: string };
export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketInfo | null>(null); const [status, setStatus] = useState<"loading" | "ready" | "error">("loading"); const [message, setMessage] = useState(""); const [downloading, setDownloading] = useState(false); const ticketRef = useRef<HTMLDivElement>(null);
  const verify = useCallback(async () => {
    setStatus("loading"); setMessage("");
    try { const response = await fetch(`${API_URL}/payments/verify/${encodeURIComponent(params.id)}`, { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "We couldn’t confirm your payment yet."); setTicket(result); setStatus("ready"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "We couldn’t confirm your payment yet."); setStatus("error"); }
  }, [params.id]);
  useEffect(() => { void verify(); }, [verify]);

  async function download(kind: "png" | "pdf") {
    if (!ticketRef.current || !ticket) return; setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: "#fffaf0", useCORS: true, logging: false });
      const fileName = `${ticket.ticketId.toLowerCase()}-royal-invitation`;
      if (kind === "png") { const anchor = document.createElement("a"); anchor.download = `${fileName}.png`; anchor.href = canvas.toDataURL("image/png"); anchor.click(); }
      else { const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] }); pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 2, canvas.height / 2); pdf.save(`${fileName}.pdf`); }
    } catch { setMessage("The download didn’t work. Please try again."); } finally { setDownloading(false); }
  }

  return <main className="ticket-page"><header className="ticket-topbar"><Link href="/" className="ticket-back"><ArrowLeft size={15} /> THE ROYAL AFFAIRS</Link><span><ShieldCheck size={14} /> SECURE TICKET CONFIRMATION</span></header><div className="ticket-page-content">
    {status === "loading" && <div className="ticket-state"><LoaderCircle className="ticket-loader" size={34} /><span>PREPARING YOUR INVITATION</span><h1>One moment,<br /><em>you’re almost in.</em></h1><p>We’re confirming your payment and preparing your royal ticket.</p></div>}
    {status === "error" && <div className="ticket-state"><span className="ticket-state-icon">✦</span><span>YOUR INVITATION</span><h1>We’re checking<br /><em>the details.</em></h1><p>{message}</p><button className="button button-burgundy" onClick={verify}>Check again <ArrowDownToLine size={15} /></button><a className="ticket-help" href="https://wa.me/2349161726678" target="_blank" rel="noreferrer">Need a hand? Contact the hosts</a></div>}
    {status === "ready" && ticket && <><div className="ticket-success-heading"><div className="success-check"><CheckCircle2 /></div><div><span>PAYMENT CONFIRMED · ₦{(ticket.amount / 100).toLocaleString("en-NG")}</span><h1>You’re <em>on the list.</em></h1><p>Dear {ticket.fullName}, your evening of royal celebration is reserved.</p></div></div><article ref={ticketRef} className="digital-ticket"><div className="digital-ticket-head"><div className="digital-ticket-brand"><span className="ticket-crown">♛</span><span>SUNRISE ZONAL TEENS CHURCH<small>CORDIALLY INVITES YOU TO</small></span></div><div className="digital-ticket-title"><div>TOMTOM</div><div>OF GALA</div><span>THE ROYAL AFFAIRS</span></div><div className="digital-ticket-scripture">“A chosen generation, a royal priesthood.” &nbsp;·&nbsp; 1 PETER 2:9</div></div><div className="digital-ticket-body"><div className="ticket-attendee"><span>PREPARED ESPECIALLY FOR</span><h2>{ticket.fullName}</h2><div className="ticket-id-line">TICKET ID <strong>{ticket.ticketId}</strong></div></div><div className="ticket-qr-block"><Image src={ticket.qrCode} alt={`Secure QR ticket for ${ticket.fullName}`} width={146} height={146} unoptimized /><span>YOUR ROYAL INVITATION</span></div><div className="ticket-perforation"><span/><span/><span/></div><div className="ticket-facts"><div><CalendarDays/><span>THE DATE<small>26 December 2026</small></span></div><div><Clock3/><span>THE HOUR<small>2:00 PM</small></span></div><div><MapPin/><span>THE PLACE<small>Sunrise Close, Block Stop, Ijaiye, Lagos</small></span></div><div><TicketCheck/><span>YOUR PARTY<small>{ticket.tickets} {ticket.tickets === 1 ? "invitation" : "invitations"}</small></span></div></div><div className="ticket-dress"><span>DRESS FOR ROYALTY</span><b>TRADITIONAL ATTIRE</b><small>{ticket.dressCode === "burgundy" ? "Burgundy · Gentlemen" : "Baby Pink · Ladies"}</small></div><div className="ticket-footer-line"><span>KEEP THIS INVITATION HANDY ON THE DAY</span><span>ROOTED IN FAITH · DRESSED FOR ROYALTY</span></div></div></article><div className="ticket-downloads"><button onClick={() => download("png")} disabled={downloading} className="button button-burgundy">{downloading ? <LoaderCircle className="ticket-loader" size={15}/> : <Download size={15}/>} Download ticket image</button><button onClick={() => download("pdf")} disabled={downloading} className="button button-outline">Download PDF</button></div><p className="email-sent-note"><CheckCircle2 size={14}/>{ticket.emailSent ? <>Ticket sent to <b>{ticket.email}</b></> : <>We’re still delivering your ticket to <b>{ticket.email}</b>. Refresh this page in a moment to retry.</>}</p><div className="ticket-bottom-meta"><Link href="/">← BACK TO THE GALA</Link><a href="https://wa.me/2349161726678" target="_blank" rel="noreferrer">QUESTIONS? SPEAK WITH THE HOSTS</a></div></>}
  </div><footer className="ticket-page-footer">SUNRISE ZONAL TEENS CHURCH <span>✦</span> TOMTOM OF GALA · 2026</footer></main>;
}
