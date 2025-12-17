import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { AppleDashboard } from "@/components/dashboard/AppleDashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Fetch latest diagnostic result
    const { data: latestResult } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return <AppleDashboard user={user} diagnosticData={latestResult} />;
  }

  // Landing Page for non-authenticated users
  return (
    <div className="relative flex min-h-screen flex-col bg-mesh-gradient text-foreground">
      {/* Glassmorphic Container */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-32">
        {/* Logo */}
        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/20 shadow-glass backdrop-blur-md animate-fadeIn">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
            <Image
              src="/logo-bs360.png"
              alt="EBI 360 Logo"
              width={80}
              height={80}
              className="object-contain logo-color-filter"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center text-4xl font-bold text-brand-dark tracking-tight animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          EBI 360
        </h1>

        <p className="mb-12 max-w-sm text-center text-lg text-gray-600 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          La primera plataforma de diagnóstico integral diseñada para la realidad de LATAM.
        </p>

        {/* Feature Cards */}
        <div className="mb-12 w-full max-w-sm space-y-4">
          <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <FeatureCard
              icon="✨"
              text="Diagnóstico de 6 dimensiones"
              iconColor="text-brand-purple bg-purple-50"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <FeatureCard
              icon="⚡"
              text="Resultados inmediatos"
              iconColor="text-brand-blue bg-blue-50"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: "0.5s" }}>
            <FeatureCard
              icon="🎯"
              text="Recomendaciones personalizadas"
              iconColor="text-brand-cyan bg-cyan-50"
            />
          </div>
        </div>

        {/* Login Form */}
        <form action="/auth/login" method="post" className="w-full max-w-sm">
          <button
            type="submit"
            className="group flex w-full items-center justify-center rounded-2xl bg-brand-blue px-8 py-5 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 animate-fadeIn"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="mr-3 rounded-full bg-white p-1">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            Ingresar con Google
          </button>
        </form>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text, iconColor }: { icon: string; text: string; iconColor: string }) {
  return (
    <div className="flex items-center space-x-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all hover:scale-[1.02] hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconColor}`}>
        {icon}
      </div>
      <span className="flex-1 font-semibold text-gray-800">{text}</span>
    </div>
  );
}
