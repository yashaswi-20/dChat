'use client';

import { Navbar } from "@/components/layout/navbar";
import { LoginButton } from "@/components/auth/login-button";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  GlobeLock,
  Lock,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useAccount } from "wagmi";

const features = [
  {
    icon: ShieldCheck,
    title: "Military-Grade Encryption",
    description: "Every message is sealed with X3DH key exchange and Double Ratchet — the same protocol trusted by Signal.",
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    icon: Zap,
    title: "Instant & Decentralized",
    description: "Messages route through XMTP's peer-to-peer network. No central server bottleneck. No single point of failure.",
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    icon: GlobeLock,
    title: "One Wallet, Every App",
    description: "Your inbox is tied to your wallet, not a platform. Switch between any XMTP app and keep every conversation.",
    accent: "from-blue-500/20 to-blue-500/0",
  },
];

const stats = [
  { label: "Protocol", value: "XMTP" },
  { label: "Encryption", value: "E2E" },
  { label: "Middlemen", value: "None" },
  { label: "Open Source", value: "100%" },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white/20 selection:text-white flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col relative">
        {/* ── Background Effects ── */}
        <div className="absolute inset-0 grid-bg pointer-events-none" />

        {/* Central glow orb */}
        <div
          className="hero-glow-orb absolute top-[40%] left-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Secondary subtle orb */}
        <div
          className="hero-glow-orb absolute top-[60%] left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(130,130,255,0.04) 0%, transparent 70%)',
            animationDelay: '3s',
          }}
        />

        {/* ── Hero Section ── */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] sm:min-h-[85vh] pt-28 sm:pt-24 px-5 sm:px-12">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-6 sm:space-y-8">

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter leading-[0.9] animate-float-up-delay-1 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              Talk Without<br className="sm:hidden" /> Trust.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed animate-float-up-delay-2">
              Connect your wallet. Send a message. Nobody in between.
              <br className="hidden md:block" />
              <span className="text-foreground/80">Not even us.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto animate-float-up-delay-3">
              <LoginButton />
              {isConnected && (
                <Link
                  href="/chat"
                  className="group px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 font-bold flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Launch App
                  <MessageSquare className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              )}
              <br />
              <a
                href="https://docs.xmtp.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-6 py-2.5 sm:px-7 sm:py-3 rounded-full border border-border/60 bg-background hover:bg-secondary/50 text-foreground transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm hover:border-border"
              >
                Read Protocol
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-4 sm:flex sm:items-center sm:gap-10 pt-4 sm:pt-6 w-full sm:w-auto animate-float-up-delay-4">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="text-center w-full sm:w-auto">
                    <div className="text-xs sm:text-base font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider sm:tracking-widest font-medium">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="hidden sm:block h-8 w-px bg-border/40 ml-3 sm:ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="relative z-10 py-16 sm:py-24 md:py-32 px-5 sm:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Why dChat?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto">
                Your keys, your messages. A chat app that respects you by default.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="feature-card rounded-xl p-5 sm:p-6 md:p-8 bg-card border border-border/40 cursor-default group"
                  >
                    {/* Icon with glow */}
                    <div className="relative mb-5">
                      <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${feature.accent} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative h-11 w-11 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Privacy Section ── */}
        <section id="privacy" className="relative z-10 py-16 sm:py-24 md:py-32 px-5 sm:px-12">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-8">
            {/* Animated rings */}
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-border/30 pulse-ring" />
              <div className="absolute inset-[-8px] rounded-full border border-border/15 pulse-ring" style={{ animationDelay: '1s' }} />
              <div className="absolute inset-[-16px] rounded-full border border-border/10 pulse-ring" style={{ animationDelay: '2s' }} />
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
              We can&apos;t read your messages.<br className="hidden sm:block" /> That&apos;s the point.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              dChat has zero access to your conversations. Messages are encrypted on your device
              before they ever leave it. No logs, no metadata, no backdoors.
            </p>

            <a
              href="https://docs.xmtp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Read the XMTP whitepaper
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-6 sm:py-8 border-t border-border/40">
        <div className="container flex justify-between items-center text-xs sm:text-sm text-muted-foreground/60 px-5 sm:px-6">
          <p className="font-medium tracking-tight">dChat &copy; 2026</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground/80 transition-colors duration-200">GitHub</a>
            <a href="#" className="hover:text-foreground/80 transition-colors duration-200">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
