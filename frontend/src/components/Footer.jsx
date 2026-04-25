import { useLocation } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

// Hide footer on auth pages
const AUTH_PATHS = ['/login', '/register', '/oauth-callback']

export default function Footer() {
  const location = useLocation()
  if (AUTH_PATHS.includes(location.pathname)) return null

  return (
    <footer className="border-t border-white/10 bg-[#0b1224] text-white">
      {/* subtle top glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-base font-semibold leading-none text-white">
                  University of Melbourne
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Smart Campus Operations Hub
                </p>
              </div>
            </div>

            

            <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
          </div>

          

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Contact
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-blue-200" />
                <p className="text-sm text-white/60">
                  University of Melbourne Campus
                  <br />
                  Parkville, VIC 3010
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-200" />
                <a
                  href="mailto:support@unimelb.edu.au"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  support@unimelb.edu.au
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-200" />
                <p className="text-sm text-white/60">
                  +61 (03) 0000 0000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} University of Melbourne 
          </p>

          <div className="flex items-center gap-4">
            <a className="text-xs text-white/40 transition hover:text-white" href="#">
              Privacy
            </a>
            <a className="text-xs text-white/40 transition hover:text-white" href="#">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}