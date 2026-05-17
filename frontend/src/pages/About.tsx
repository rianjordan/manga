import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'

type TabType = 'about' | 'terms' | 'privacy' | 'dmca'

export function AboutPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('about')

  // Set active tab based on current URL path
  useEffect(() => {
    const path = location.pathname
    if (path.includes('terms')) {
      setActiveTab('terms')
    } else if (path.includes('privacy')) {
      setActiveTab('privacy')
    } else if (path.includes('dmca')) {
      setActiveTab('dmca')
    } else {
      setActiveTab('about')
    }
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const tabs = [
    { id: 'about' as TabType, label: 'About Us', icon: 'fa-circle-info', path: '/about' },
    { id: 'terms' as TabType, label: 'Rules of Service', icon: 'fa-gavel', path: '/terms' },
    { id: 'privacy' as TabType, label: 'Privacy Policy', icon: 'fa-shield-halved', path: '/privacy' },
    { id: 'dmca' as TabType, label: 'DMCA & Copyright', icon: 'fa-copyright', path: '/dmca' },
  ]

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <img src="/favicon.svg" alt="" className="w-5 h-5 rounded" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Legal & Info Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Reader's <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Haven</span>
          </h1>
          <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
            Everything you need to know about our modern manga reader client platform, user rules of service, privacy guidelines, and DMCA copyright policies.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Navigation (Desktop) / Top Tabs (Mobile) */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <div className="bg-card/40 backdrop-blur-md border border-gray-800/40 rounded-2xl p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 scrollbar-none shadow-xl">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap lg:whitespace-normal group ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                        : 'text-muted hover:text-white hover:bg-gray-800/20 border border-transparent'
                    }`}
                  >
                    <i className={`fa-solid ${tab.icon} text-base transition-transform group-hover:scale-110`} />
                    <span>{tab.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Quick API Status / Attribution Badge */}
            <div className="hidden lg:block bg-card/10 backdrop-blur-md border border-gray-800/20 rounded-2xl p-5 text-center mt-4">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> API Connected
              </span>
              <p className="text-xs text-muted/80 leading-relaxed">
                Reader's Haven queries the <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">MangaDex API</a> dynamically. All assets belong to their respective creators.
              </p>
            </div>
          </div>

          {/* Content Card Panel */}
          <div className="lg:col-span-3">
            <div className="bg-card/30 backdrop-blur-md border border-gray-800/40 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[500px] flex flex-col justify-between">
              <div>
                {/* 1. ABOUT US CONTENT */}
                {activeTab === 'about' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-800/60 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i className="fa-solid fa-circle-info text-lg" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">About Reader's Haven</h2>
                    </div>

                    <p className="text-sm sm:text-base text-muted leading-relaxed">
                      Reader's Haven is a premium, high-fidelity, ad-free web platform designed exclusively for manga, manhwa, and manhua lovers who demand a gorgeous, responsive, and distraction-free interface.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="bg-card/50 border border-gray-800/40 rounded-2xl p-5 hover:border-sky-500/20 transition-all duration-300">
                        <i className="fa-solid fa-wand-magic-sparkles text-xl text-sky-400 mb-3" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1.5">Modern High-Fidelity UI</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Glassmorphic dark design with dynamic gradients, responsive grids, fast sidebar menus, and interactive custom forums.
                        </p>
                      </div>

                      <div className="bg-card/50 border border-gray-800/40 rounded-2xl p-5 hover:border-sky-500/20 transition-all duration-300">
                        <i className="fa-solid fa-file-pdf text-xl text-purple-400 mb-3" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1.5">Premium Downloads</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Compile complete chapters into high-fidelity aspect ratio-preserving PDF documents, CBZ comic volumes, or ZIP formats instantly.
                        </p>
                      </div>

                      <div className="bg-card/50 border border-gray-800/40 rounded-2xl p-5 hover:border-sky-500/20 transition-all duration-300">
                        <i className="fa-solid fa-bolt text-xl text-amber-400 mb-3" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1.5">Infinite Pagination & Cache</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Our smart proxy recursively loads entire volumes in the background so you never lose chapters or hit limit caps.
                        </p>
                      </div>

                      <div className="bg-card/50 border border-gray-800/40 rounded-2xl p-5 hover:border-sky-500/20 transition-all duration-300">
                        <i className="fa-solid fa-hand-holding-heart text-xl text-emerald-400 mb-3" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1.5">100% Ad-Free & Free</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Supported by enthusiasts. We serve zero advertisements, run no trackers, and use mock logins to protect user identity.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-500/10 rounded-2xl p-5 mt-6">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation text-sky-400" /> Developer Notice & API Attribution
                      </h4>
                      <p className="text-xs text-muted leading-relaxed">
                        Reader's Haven is a third-party client built on top of the public <a href="https://api.mangadex.org" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">MangaDex API</a>. We are not officially affiliated with MangaDex or any scanlation groups. All translation scripts and image resources belong to their respective uploaders. If you like the platform, please consider supporting the original creators and scanlation teams!
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. RULES OF SERVICE CONTENT */}
                {activeTab === 'terms' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-800/60 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i className="fa-solid fa-gavel text-lg" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Rules of Service (RoS)</h2>
                    </div>

                    <p className="text-xs text-muted mb-4">Last Updated: May 18, 2026</p>

                    <div className="space-y-4">
                      <section className="bg-card/35 p-5 border border-gray-800/40 rounded-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">1. Acceptable Use</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Reader's Haven is provided solely for personal, non-commercial reading and entertainment. By accessing or using the site, you agree to refrain from scraping, bot-crawling, DDoS attacks, or abusing the underlying MangaDex API/CDN nodes.
                        </p>
                      </section>

                      <section className="bg-card/35 p-5 border border-gray-800/40 rounded-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">2. Accounts and Authentication</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Our authentication system utilizes a secure mock format requiring only an email (acting as a mock session token) to store history logs, bookmarked manga, and comments in our Cloudflare D1 database. Users are solely responsible for keeping their login credentials confidential.
                        </p>
                      </section>

                      <section className="bg-card/35 p-5 border border-gray-800/40 rounded-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">3. User Conduct on Forums & Comments</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          We believe in creating a supportive community. Any comments or forum posts containing hate speech, illegal material, commercial spam, phishing links, or severe harassment will be instantly removed, and the offending mock user profile will be banned permanently.
                        </p>
                      </section>

                      <section className="bg-card/35 p-5 border border-gray-800/40 rounded-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">4. Disclaimers & Availability</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Reader's Haven serves content dynamically via external CDNs. We make no guarantees regarding content availability, language translations, image load speeds, or API up-time. Service is provided "as is" and "as available" without warranties of any kind.
                        </p>
                      </section>
                    </div>
                  </div>
                )}

                {/* 3. PRIVACY POLICY CONTENT */}
                {activeTab === 'privacy' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-800/60 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <i className="fa-solid fa-shield-halved text-lg" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                    </div>

                    <p className="text-xs text-muted mb-4">Last Updated: May 18, 2026</p>

                    <div className="space-y-4 text-xs text-muted leading-relaxed">
                      <p>
                        At Reader's Haven, user privacy is one of our absolute core tenets. We do not run trackers, serve ads, sell data, or compile dossiers on our readers. Here is a transparent breakdown of what data is collected and how it is utilized:
                      </p>

                      <div className="bg-card/35 border border-gray-800/40 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white">💾 Database Storage & Cookies</h3>
                        <p>
                          * **Account Credentials:** When you register, we store your username, selected avatar image, and email identifier in our secure Cloudflare D1 database.
                        </p>
                        <p>
                          * **Reading Logs:** Your reading history (completed chapters, last page viewed) and manga bookmarks are stored in your profile so you can resume reading smoothly across different devices.
                        </p>
                        <p>
                          * **Local Storage:** We utilize local browser cookies or LocalStorage to persist UI settings (such as reader layout direction, theme colors, and download preferences). No personal data is stored in these values.
                        </p>
                      </div>

                      <div className="bg-card/35 border border-gray-800/40 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white">🌐 Third-Party Connections</h3>
                        <p>
                          Because all manga metadata and images are retrieved dynamically, using this site establishes a direct connection between your browser and the official **MangaDex API/CDN**. 
                        </p>
                        <p>
                          Your IP address and typical browser header details will be visible to MangaDex server load balancers. We strongly encourage you to review the <a href="https://mangadex.org/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">MangaDex Privacy Policy</a> for information on their CDN routing, caching, and logs.
                        </p>
                      </div>

                      <div className="bg-card/35 border border-gray-800/40 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white">🤝 Data Protection</h3>
                        <p>
                          We will never share, trade, or distribute your stored mock profile information with third parties unless required by local law enforcement. All D1 databases utilize encrypted Cloudflare infrastructure to prevent data breaches.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DMCA & COPYRIGHT POLICY CONTENT */}
                {activeTab === 'dmca' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-800/60 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <i className="fa-solid fa-copyright text-lg" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">DMCA & Copyright Policy</h2>
                    </div>

                    <p className="text-xs text-muted mb-4">Last Updated: May 18, 2026</p>

                    <div className="space-y-4 text-xs sm:text-sm text-muted leading-relaxed">
                      
                      <div className="border-l-4 border-rose-500 bg-rose-500/5 p-4 rounded-r-xl">
                        <h3 className="font-bold text-white mb-1.5">Direct Dynamic Client Proxy Disclaimer</h3>
                        <p className="text-xs">
                          Reader's Haven operates **strictly as a dynamic, client-side browser proxy interface**. We do not possess, store, host, or cache any manga scan pages, translation scripts, metadata files, or catalog files on our own servers. 
                        </p>
                      </div>

                      <p className="text-xs">
                        All images, text logs, titles, chapters, and scanlation assets rendered in Reader's Haven are requested directly from the **MangaDex API** in real-time. Because of this architectural layout:
                      </p>

                      <div className="bg-card/35 border border-gray-800/40 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white">📣 How Takedowns Work</h3>
                        <p className="text-xs">
                          * **MangaDex Takedown:** If you are a copyright holder, publisher, or artist and wish to restrict access to your intellectual property, you must contact **MangaDex directly** via their official DMCA portal or support tickets at <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">https://mangadex.org</a>.
                        </p>
                        <p className="text-xs">
                          * **Instant Removal:** Because our client queries MangaDex dynamically, any chapter, volume, or full manga series that is deleted, locked, or restricted on MangaDex **instantly and automatically disappears from Reader's Haven** at the exact same millisecond!
                        </p>
                      </div>

                      <div className="bg-card/35 border border-gray-800/40 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-white">📬 Direct Contact</h3>
                        <p className="text-xs">
                          While we cannot remove content from MangaDex ourselves, we fully respect intellectual property rights. If you have inquiries, need assistance reaching out to the MangaDex compliance team, or have general concerns, you can contact us at <span className="text-sky-400">dmca@readershaven.com</span> or via our official GitHub repository.
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Back to Home Button */}
              <div className="border-t border-gray-800/50 pt-6 mt-8 flex justify-between items-center text-xs text-muted">
                <span>Reader's Haven Portal</span>
                <Link to="/" className="text-sky-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors group">
                  Back to Home <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
