import re

filepath = "/Users/renoroy/Downloads/app 8/src/pages/AdminDashboard.tsx"

with open(filepath, 'r', encoding='utf-8') as file:
    content = file.read()

# 1. Update modal wrapper to support natural page-overlay scrolling and expand width
content = content.replace(
    '<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">',
    '<div className="fixed inset-0 z-50 flex justify-center p-4 md:p-12 bg-black/85 backdrop-blur-sm overflow-y-auto">'
)
content = content.replace(
    '<div className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/5 rounded-2xl p-6 xl:p-8 shadow-2xl max-h-[90vh] overflow-y-auto my-8">',
    '<div className="relative w-full max-w-3xl bg-[#0e0e11] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl my-auto">'
)

# 2. Redesign Testimonials list layout
testimonials_old = """                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {homepageForm.testimonials && homepageForm.testimonials.map((test: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 relative group">
                            
                            <button
                              type="button"
                              onClick={() => {
                                const list = homepageForm.testimonials.filter((_: any, tIdx: number) => tIdx !== idx)
                                setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                              }}
                              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 p-1 border border-white/5 hover:border-red-500/20 rounded cursor-pointer"
                              title="Delete testimonial"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-2 gap-2 pr-6">
                              <input
                                type="text"
                                placeholder="Client Name"
                                value={test.name}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].name = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="px-2 py-1.5 rounded bg-white/[0.01] border border-white/5 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Location (e.g. Dubai Marina)"
                                value={test.location}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].location = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="px-2 py-1.5 rounded bg-white/[0.01] border border-white/5 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Role (e.g. Watch Collector)"
                                value={test.role}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].role = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="px-2 py-1.5 rounded bg-white/[0.01] border border-white/5 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Watch Model Purchased"
                                value={test.watchBought}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].watchBought = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="px-2 py-1.5 rounded bg-white/[0.01] border border-white/5 text-gold"
                              />
                              <select
                                value={test.rating || 5}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].rating = parseInt(e.target.value) || 5
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="px-2 py-1.5 rounded bg-[#0e0e11] border border-white/5 text-white"
                              >
                                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                              </select>
                            </div>

                            <textarea
                              rows={3}
                              placeholder="Review quotation text..."
                              value={test.quote}
                              onChange={(e) => {
                                const list = [...homepageForm.testimonials]
                                list[idx].quote = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                              }}
                              className="w-full px-3 py-2 rounded bg-white/[0.01] border border-white/5 text-silver resize-y"
                            />
                          </div>
                        ))}
                      </div>"""

testimonials_new = """                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {homepageForm.testimonials && homepageForm.testimonials.map((test: any, idx: number) => (
                          <div key={idx} className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4 relative group hover:border-gold/30 transition-all duration-300">
                            
                            <button
                              type="button"
                              onClick={() => {
                                const list = homepageForm.testimonials.filter((_: any, tIdx: number) => tIdx !== idx)
                                setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                              }}
                              className="absolute top-6 right-6 text-gray-400 hover:text-red-400 p-1.5 border border-white/10 hover:border-red-500/20 rounded-lg cursor-pointer transition-all duration-200"
                              title="Delete testimonial"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="space-y-4 pr-8">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Faisal Al-Mansoori"
                                    value={test.name}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].name = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Location</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Dubai Marina, UAE"
                                    value={test.location}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].location = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Role / Profession</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Watch Collector"
                                    value={test.role}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].role = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Watch Model Purchased</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Rolex Daytona Panda"
                                    value={test.watchBought}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].watchBought = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-gold font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Rating Score</label>
                                <select
                                  value={test.rating || 5}
                                  onChange={(e) => {
                                    const list = [...homepageForm.testimonials]
                                    list[idx].rating = parseInt(e.target.value) || 5
                                    setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                  }}
                                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#0e0e11] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                >
                                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Review Quote Description</label>
                              <textarea
                                rows={6}
                                placeholder="Write testimonial description..."
                                value={test.quote}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].quote = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-gray-200 focus:border-gold focus:outline-none resize-y font-mono min-h-[160px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>"""

content = content.replace(testimonials_old, testimonials_new)

# 3. Standardize and expand all textarea text sizes, borders, focus rings, and rows
content = re.sub(
    r'<textarea\s+required\s+rows=\{\d+\}',
    '<textarea required rows={6}',
    content
)
content = re.sub(
    r'<textarea\s+rows=\{\d+\}',
    '<textarea rows={6}',
    content
)

# Textarea class conversions
content = content.replace(
    'className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-silver resize-y font-mono"',
    'className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"'
)
content = content.replace(
    'className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-silver resize-y"',
    'className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"'
)
content = content.replace(
    'className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white font-mono resize-y"',
    'className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"'
)
content = content.replace(
    'className="w-full px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-white resize-y"',
    'className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"'
)
content = content.replace(
    'className="w-full px-3 py-2 rounded bg-white/[0.01] border border-white/5 text-silver resize-y"',
    'className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"'
)

# Text labels font updates
content = content.replace(
    '<label className="text-[9px] text-gray-500 font-mono">',
    '<label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">'
)

with open(filepath, 'w', encoding='utf-8') as file:
    file.write(content)

print("Modal styling and textarea adjustments complete successfully!")
