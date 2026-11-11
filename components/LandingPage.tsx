"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, Crown, Instagram, MapPin, Menu, Minus, Plus, ShieldCheck, Sparkles, Ticket, X } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/BrandMark";
import PhotoGallery from "@/components/PhotoGallery";
import { API_URL, EVENT } from "@/lib/constants";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .7, ease: "easeOut" as const } } };

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", gender: "", tickets: 1, dressCode: "" });
  const [error, setError] = useState("");
  const update = (field: string, value: string | number) => setForm(current => ({ ...current, [field]: value }));
  const closeDialog = () => { setDialogOpen(false); setStep("form"); setError(""); };
  const openRegistration = () => { setDialogOpen(true); setMenuOpen(false); };

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStep("loading"); setError("");
    try {
      const response = await fetch(`${API_URL}/payments/initialize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We couldn't start your registration. Please try again.");
      if (typeof result.authorizationUrl !== "string" || !result.authorizationUrl.startsWith("https://")) throw new Error("Secure checkout is temporarily unavailable. Please try again.");
      window.location.assign(result.authorizationUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); setStep("error"); }
  }

  return <main id="top" className="gala-site">
    <div className="announcement"><Sparkles size={12}/><span>26 DECEMBER 2026 <i>·</i> IJAIYE, LAGOS</span><Sparkles size={12}/></div>
    <header className="site-header"><BrandMark/><nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Main navigation"><a href="#experience" onClick={() => setMenuOpen(false)}>The evening</a><a href="#details" onClick={() => setMenuOpen(false)}>When &amp; where</a><a href="#dress-code" onClick={() => setMenuOpen(false)}>Dress code</a><button className="nav-mobile-cta" onClick={openRegistration}>Reserve your invitation <ArrowRight size={15}/></button></nav><button className="button button-dark header-cta" onClick={openRegistration}>Get your invitation <ArrowUpRight size={15}/></button><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X/> : <Menu/>}</button></header>

    <section className="hero hero-redesign" aria-labelledby="hero-title"><div className="hero-image"/><div className="hero-veil"/><div className="hero-grain"/>
      <div className="hero-layout"><motion.div className="hero-content" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .12, delayChildren: .18 } } }}>
        <motion.div variants={fadeUp} className="hero-kicker"><span/> SUNRISE ZONAL TEENS CHURCH <span/></motion.div>
        <motion.p variants={fadeUp} className="hero-year">INVITES YOU TO AN EVENING OF</motion.p>
        <motion.h1 variants={fadeUp} id="hero-title">TomTom<br/><em>of Gala</em></motion.h1>
        <motion.div variants={fadeUp} className="hero-subtitle"><span/> THE ROYAL AFFAIRS <span/></motion.div>
        <motion.p variants={fadeUp} className="hero-scripture">A night to gather, celebrate and feel a little more royal.</motion.p>
        <motion.div variants={fadeUp} className="hero-actions"><button className="button button-gold" onClick={openRegistration}>Reserve your place <ArrowRight size={16}/></button><a className="text-link" href="#experience">Explore the evening <ArrowDown size={14}/></a></motion.div>
      </motion.div>
      <motion.aside className="hero-invitation-card" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .55 }}><span className="invitation-card-top"><Crown size={15}/> YOUR INVITATION</span><span className="invitation-card-date">26<small>DEC</small></span><span className="invitation-card-rule"/><span className="invitation-card-bottom">SATURDAY · 2:00 PM<br/><b>IJAIYE, LAGOS</b></span><span className="invitation-card-price">₦3,000 <small>PER GUEST</small></span></motion.aside></div>
      <div className="hero-side-label">A ROYAL GATHERING <span>✳</span> ONE NIGHT ONLY</div><div className="hero-bottom"><span>26 <b>DEC</b></span><span className="hero-bottom-line"/><span>IJAIYE, LAGOS</span><span className="hero-bottom-line"/><span>TRADITIONAL ATTIRE</span></div>
    </section>

    <div className="marquee-band"><div className="marquee-track"><span>THE ROYAL AFFAIRS</span><i>✦</i><span>AN EVENING TO GATHER</span><i>✦</i><span>THE ROYAL AFFAIRS</span><i>✦</i><span>AN EVENING TO GATHER</span><i>✦</i><span>THE ROYAL AFFAIRS</span><i>✦</i></div></div>

    <section id="experience" className="experience-redesign section-wrap"><div className="experience-copy"><div className="section-eyebrow"><span>✦</span> A LITTLE MORE THAN A PARTY</div><h2>Make room for<br/><em>the moment.</em></h2><div className="gold-divider"><span>✦</span></div><p>For the people, the culture and the memories we carry with us. TomTom of Gala brings everyone together for one special evening shaped by tradition and a little royal sparkle.</p><p className="experience-signoff">Hosted with love by <strong>Sunrise Zonal Teens Church.</strong></p><button className="underline-link" onClick={openRegistration}>Be part of it <ArrowRight size={15}/></button></div>
      <div className="experience-visual"><div className="experience-visual-image"/><div className="experience-visual-shade"/><div className="experience-visual-caption"><span>THE ROYAL AFFAIRS</span><b>An evening<br/>to remember.</b><i>26 · 12 · 26</i></div><div className="experience-visual-seal">✳<small>IJAIYE<br/>LAGOS</small></div></div>
    </section>

    <section className="feeling-section"><div className="feeling-heading"><div className="section-eyebrow section-eyebrow-light"><span>✦</span> COME FOR THE EVENING</div><h2>Leave with a <em>memory.</em></h2></div><div className="feeling-grid"><article className="feeling-card feeling-card-one"><span>01 / THE FEELING</span><div className="feeling-card-mark">✳</div><h3>A room full<br/>of your people.</h3><p>Good company makes a special night unforgettable.</p></article><article className="feeling-card feeling-card-two"><span>02 / THE TRADITION</span><div className="feeling-card-mark">♛</div><h3>Show up<br/>as royalty.</h3><p>Bring your culture with you. Dress for the occasion.</p></article><article className="feeling-card feeling-card-three"><span>03 / THE MOMENT</span><div className="feeling-card-mark">✦</div><h3>One night.<br/>All the sparkle.</h3><p>Make a little space in the year for something beautiful.</p></article></div><div className="feeling-footnote">TOMTOM OF GALA <span>·</span> SUNRISE ZONAL TEENS CHURCH</div></section>

    <PhotoGallery/>

    <section id="details" className="details-section details-redesign"><div className="section-wrap details-wrap"><div className="details-heading"><div className="section-eyebrow section-eyebrow-light"><span>✦</span> SAVE THE DATE</div><h2>The evening,<br/><em>at a glance.</em></h2><p>Everything you need to know before the celebration.</p></div><div className="details-grid">
      <div className="detail-card"><div className="detail-icon"><CalendarDays/></div><span className="detail-overline">THE DATE</span><h3>26 December</h3><p>Saturday · Boxing Day<br/>A night to close the year in splendour.</p><span className="card-index">01</span></div>
      <div className="detail-card"><div className="detail-icon"><Clock3/></div><span className="detail-overline">THE HOUR</span><h3>2:00 PM</h3><p>We’ll be ready to welcome you<br/>when the celebration begins.</p><span className="card-index">02</span></div>
      <div className="detail-card"><div className="detail-icon"><MapPin/></div><span className="detail-overline">THE PLACE</span><h3>Ijaiye, Lagos</h3><p>Sunrise Close, Block Stop,<br/>Ijaiye, Lagos.</p><a className="map-link" href="https://maps.google.com/?q=Sunrise+Close+Block+Stop+Ijaiye+Lagos" target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={13}/></a><span className="card-index">03</span></div>
      <div className="detail-card detail-card-price"><div className="detail-icon"><Ticket/></div><span className="detail-overline">YOUR INVITATION</span><h3>₦3,000</h3><p>Per guest. Reserve your<br/>place for the evening.</p><button className="price-card-link" onClick={openRegistration}>Choose your place <ArrowRight size={13}/></button><span className="card-index">04</span></div>
    </div></div></section>

    <section id="dress-code" className="dress-redesign section-wrap"><div className="dress-copy"><div className="section-eyebrow"><span>✦</span> COME AS ROYALTY</div><h2>Dress for<br/><em>your entrance.</em></h2><p>Traditional attire, worn your way. Choose your colour and bring your own sense of occasion.</p><div className="dress-note"><Crown size={18}/><span>THE ROYAL DRESS CODE<small>Traditional · Refined · Unforgettable</small></span></div><button className="button button-burgundy" onClick={openRegistration}>Save my place <ArrowRight size={16}/></button></div><div className="dress-swatches"><div className="swatch swatch-burgundy"><div className="swatch-disc">✦</div><div className="swatch-copy"><span>FOR THE GENTLEMEN</span><h3>Burgundy</h3><span>RICH · REGAL · TIMELESS</span></div><div className="swatch-corner">✳</div></div><div className="swatch swatch-pink"><div className="swatch-disc">✦</div><div className="swatch-copy"><span>FOR THE LADIES</span><h3>Baby<br/>Pink</h3><span>SOFT · BEAUTIFUL · ROYAL</span></div><div className="swatch-corner">✳</div></div><div className="swatch-caption">TRADITIONAL ATTIRE · YOUR ROYAL MOMENT</div></div></section>

    <section className="ticket-callout ticket-callout-redesign"><div className="ticket-stars">✦ &nbsp; ✧ &nbsp; ✦</div><div className="section-eyebrow section-eyebrow-light">YOUR PLACE IS WAITING</div><h2>Make it a night<br/>to <em>remember.</em></h2><p>Gather your people, choose your look and join us for the Royal Affairs.</p><button className="button button-gold" onClick={openRegistration}>Claim your invitation <ArrowRight size={16}/></button><span className="ticket-callout-meta">26 DECEMBER 2026 &nbsp; · &nbsp; IJAIYE, LAGOS &nbsp; · &nbsp; ₦3,000</span></section>

    <div className="trust-strip"><div><ShieldCheck/><span>SECURE PAYSTACK CHECKOUT<small>Protected end to end</small></span></div><div><Ticket/><span>A UNIQUE TICKET<small>QR ready for the door</small></span></div><div><CalendarDays/><span>READY FOR DECEMBER<small>26 December · 2:00 PM</small></span></div></div>

    <footer className="site-footer"><div className="footer-top"><BrandMark light/><p>One night. One royal affair.<br/>We’ll save you a place.</p><div className="footer-social"><a href={`https://instagram.com/${EVENT.instagram}`} target="_blank" rel="noreferrer"><Instagram size={15}/> @{EVENT.instagram}</a><a href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noreferrer"><span className="whatsapp-glyph">✆</span> Chat with the hosts</a></div><button className="button button-gold footer-button" onClick={openRegistration}>Reserve your seat <ArrowRight size={15}/></button></div><div className="footer-bottom"><span>© 2026 SUNRISE ZONAL TEENS CHURCH</span><span>ROOTED IN FAITH. DRESSED FOR ROYALTY.</span><a href="/admin">ORGANISER ACCESS</a></div></footer>

    {dialogOpen && <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) closeDialog(); }} role="presentation"><div className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="register-title"><button className="modal-close" onClick={closeDialog} aria-label="Close registration"><X size={19}/></button><div className="modal-top"><span>✦ &nbsp; YOUR ROYAL INVITATION &nbsp; ✦</span><div className="modal-seal"><Crown size={20}/></div><h2 id="register-title">Reserve your<br/><em>place.</em></h2><p>It only takes a moment. We’ll have your invitation ready soon.</p></div><div className="modal-progress"><span className="progress-active"/><span/><span/></div><form className="registration-form" onSubmit={submitRegistration}>
      <label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={form.fullName} onChange={event => update("fullName", event.target.value)} placeholder="The name on your invitation"/></label>
      <div className="form-pair"><label>Email address<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="you@example.com"/></label><label>Phone number<input required type="tel" pattern="[+0-9 ()-]{7,20}" autoComplete="tel" value={form.phone} onChange={event => update("phone", event.target.value)} placeholder="0800 000 0000"/></label></div>
      <div className="form-pair"><label>Gender<select required value={form.gender} onChange={event => { update("gender", event.target.value); update("dressCode", event.target.value === "male" ? "burgundy" : "baby-pink"); }}><option value="" disabled>Select gender</option><option value="male">Male</option><option value="female">Female</option></select><ChevronDown className="select-chevron" size={14}/></label><label>Dress code<select required value={form.dressCode} onChange={event => update("dressCode", event.target.value)}><option value="" disabled>Choose your colour</option><option value="burgundy">Burgundy · Male</option><option value="baby-pink">Baby Pink · Female</option></select><ChevronDown className="select-chevron" size={14}/></label></div>
      <div className="ticket-stepper"><div><span>HOW MANY INVITATIONS?</span><small>₦3,000 per guest</small></div><div className="stepper-controls"><button type="button" aria-label="Remove a ticket" disabled={form.tickets <= 1} onClick={() => update("tickets", Math.max(1, form.tickets - 1))}><Minus size={15}/></button><b>{form.tickets}</b><button type="button" aria-label="Add a ticket" disabled={form.tickets >= 10} onClick={() => update("tickets", Math.min(10, form.tickets + 1))}><Plus size={15}/></button></div></div>
      <div className="order-total"><span>TOTAL TO PAY</span><strong>₦{(form.tickets * EVENT.price).toLocaleString("en-NG")}</strong></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-burgundy modal-submit" disabled={step === "loading"} type="submit">{step === "loading" ? <><span className="button-spinner"/> Preparing secure checkout…</> : <>Continue to secure checkout <ArrowRight size={16}/></>}</button><div className="secure-note"><ShieldCheck size={13}/> SECURELY PROCESSED BY PAYSTACK</div>
    </form></div></div>}
  </main>;
}
