"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-mockup">
      {/* Glassmorphic Container */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-32">
        {/* Logo */}
        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/20 shadow-glass backdrop-blur-md animate-fadeIn">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
            <Image
              src="/logo.png"
              alt="Bienestar 360° Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center text-4xl font-bold text-white drop-shadow-lg animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          Bienestar 360°
        </h1>

        <p className="mb-12 max-w-sm text-center text-lg text-white drop-shadow animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          La primera plataforma de diagnóstico integral diseñada para la realidad de LATAM.
        </p>

        {/* Feature Cards */}
        <div className="mb-12 w-full max-w-sm space-y-3">
          <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <FeatureCard
              icon="✨"
              text="Diagnóstico de 6 dimensiones"
              bgColor="bg-purple-500/30"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <FeatureCard
              icon="⚡"
              text="Resultados inmediatos"
              bgColor="bg-blue-500/30"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: "0.5s" }}>
            <FeatureCard
              icon="🎯"
              text="Recomendaciones personalizadas"
              bgColor="bg-pink-500/30"
            />
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/diagnostico"
          className="group flex w-full max-w-sm items-center justify-center rounded-2xl bg-white px-8 py-5 text-lg font-bold text-purple-700 shadow-glass-lg transition-all hover:scale-105 hover:shadow-2xl active:scale-95 animate-fadeIn animate-pulse"
          style={{ animationDelay: "0.6s" }}
        >
          Comenzar Diagnóstico
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text, bgColor }: { icon: string; text: string; bgColor: string }) {
  return (
    <div className={`flex items-center space-x-4 rounded-2xl ${bgColor} border border-white/20 p-4 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-white/20`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 text-2xl backdrop-blur-sm">
        {icon}
      </div>
      <span className="flex-1 font-semibold text-white drop-shadow">{text}</span>
    </div>
  );
}
