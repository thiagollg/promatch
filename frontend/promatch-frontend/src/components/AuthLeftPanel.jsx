import React from 'react'
import { GraduationCap } from 'lucide-react'

const AuthLeftPanel = () => {
  return (
    <aside className="relative flex items-center justify-center bg-black text-white px-8 md:px-16 py-12 md:py-0 min-h-[400px] md:min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
  
      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
  
      {/* Subtle glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
  
      {/* Content */}
      <div className="relative z-10 w-full max-w-xl md:pl-2">
        {/* Logo */}
        <div className="mb-6 md:mb-10 flex items-center gap-3 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/20 hover:ring-white/30 transition-all duration-300">
            <GraduationCap className="h-6 w-6 text-white" />
          </span>
          <span className="text-xl font-bold">ProMatch</span>
        </div>
  
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-4 animate-fade-in text-white">
          Aprende con los mejores
        </h1>
  
        {/* Subtitle */}
        <p className="mt-3 text-gray-300 text-base md:text-xl leading-relaxed max-w-md">
          Conecta con profesores expertos y transforma tu futuro académico. Miles de estudiantes ya confían en nosotros para alcanzar sus metas.
        </p>
  
        {/* Features list */}
        <div className="mt-6 md:mt-10 space-y-3 md:space-y-4">
          {["Profesores certificados", "Clases personalizadas", "Horarios flexibles"].map((text, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <span className="text-gray-200">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
  
}

export default AuthLeftPanel

