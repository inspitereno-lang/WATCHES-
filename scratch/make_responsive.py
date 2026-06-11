filepath = "/Users/renoroy/Downloads/app 8/src/pages/AdminDashboard.tsx"

with open(filepath, 'r', encoding='utf-8') as file:
    content = file.read()

# 1. Update Navigation Sidebar to support horizontal scrolling/flexrow layout on mobile
sidebar_old = """        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-6">
          <div className="space-y-2">
            <h3 className="px-4 text-[11px] tracking-[0.2em] font-mono text-gray-400 uppercase font-bold">
              INVENTORY
            </h3>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3.5 ${
                activeTab === 'products'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-4.5 h-4.5" />
              WATCH CATALOGUE
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="px-4 text-[11px] tracking-[0.2em] font-mono text-gray-400 uppercase font-bold">
              HOMEPAGE CMS
            </h3>
            {[
              { key: 'hero', label: 'HERO & SPECS BAR' },
              { key: 'arrivals', label: 'NEW ARRIVALS' },
              { key: 'details', label: 'CLONE WATCH & LUME' },
              { key: 'heritage', label: 'HERITAGE ATELIER & RM' },
              { key: 'testimonials', label: 'CLIENT TESTIMONIALS' },
              { key: 'footer', label: 'FOOTER & CONTACTS' }
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => {
                  setActiveTab('homepage')
                  setActiveSubTab(sub.key as any)
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3.5 ${
                  activeTab === 'homepage' && activeSubTab === sub.key
                    ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                    : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <FileEdit className="w-4.5 h-4.5" />
                {sub.label}
              </button>
            ))}
          </div>
        </aside>"""

sidebar_new = """        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-3 md:pb-0 flex-nowrap md:flex-wrap scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3 shrink-0 ${
                activeTab === 'products'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              WATCH CATALOGUE
            </button>

            {[
              { key: 'hero', label: 'HERO & SPECS BAR' },
              { key: 'arrivals', label: 'NEW ARRIVALS' },
              { key: 'details', label: 'CLONE WATCH & LUME' },
              { key: 'heritage', label: 'HERITAGE ATELIER & RM' },
              { key: 'testimonials', label: 'CLIENT TESTIMONIALS' },
              { key: 'footer', label: 'FOOTER & CONTACTS' }
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => {
                  setActiveTab('homepage')
                  setActiveSubTab(sub.key as any)
                }}
                className={`whitespace-nowrap px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3 shrink-0 ${
                  activeTab === 'homepage' && activeSubTab === sub.key
                    ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                    : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <FileEdit className="w-4 h-4 shrink-0" />
                {sub.label}
              </button>
            ))}
          </div>
        </aside>"""

content = content.replace(sidebar_old, sidebar_new)

# 2. Convert specific rigid grid-cols-2 to responsive grid-cols-1 sm:grid-cols-2
# Let's inspect other grid-cols-2 blocks in the subtabs

# A. Celestial Complication under Details
content = content.replace(
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Specs details section (e.g. Celestial Complication)</h4>\n                      <div className="grid grid-cols-2 gap-4">',
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Specs details section (e.g. Celestial Complication)</h4>\n                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
)

# B. Lume Section
content = content.replace(
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Luminescence watch section (Nautilus Lume dial)</h4>\n                      <div className="grid grid-cols-2 gap-4">',
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Luminescence watch section (Nautilus Lume dial)</h4>\n                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
)

# C. Heritage Block
content = content.replace(
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Atelier Heritage block (Maison Aeterna)</h4>\n                      <div className="grid grid-cols-2 gap-4">',
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Atelier Heritage block (Maison Aeterna)</h4>\n                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
)

# D. RM Nocturne
content = content.replace(
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Nocturne section (Richard Mille Kongo)</h4>\n                      <div className="grid grid-cols-2 gap-4">',
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Nocturne section (Richard Mille Kongo)</h4>\n                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
)

# E. Footer
content = content.replace(
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Footer contacts & links</h4>\n                      <div className="grid grid-cols-2 gap-4">',
    '                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">\n                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Footer contacts & links</h4>\n                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
)

# F. Modal specs brand/factory
content = content.replace(
    '                <div className="grid grid-cols-2 gap-3">\n                  <div className="space-y-1">\n                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Brand</label>',
    '                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">\n                  <div className="space-y-1">\n                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Brand</label>'
)

# G. Modal specs prices
content = content.replace(
    '                <div className="grid grid-cols-2 gap-3">\n                  <div className="space-y-1">\n                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Price (USD)</label>',
    '                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">\n                  <div className="space-y-1">\n                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Price (USD)</label>'
)

with open(filepath, 'w', encoding='utf-8') as file:
    file.write(content)

print("Mobile responsive grid and sidebar updates applied successfully!")
