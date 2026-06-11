import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ShieldAlert, KeyRound, User, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || 'Server error during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background glowing gold orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e0e11] border border-white/5 rounded-2xl p-8 shadow-2xl relative">
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gold/30 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-gold/30 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-gold/30 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-gold/30 rounded-br-2xl" />

        <div className="text-center mb-8">
          <span className="text-[10px] tracking-[0.3em] font-mono text-gold uppercase font-bold">
            SECURE ACCESS GATEWAY
          </span>
          <h1 className="text-2xl font-light tracking-tight text-white mt-2">
            T24 WATCHES <span className="text-gold font-semibold">DUBAI</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1 uppercase">
            Administrative Control Panel
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="font-mono uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">
              Username ID
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter administrator ID..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/20 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">
              Security Keyphrase
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/20 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold hover:bg-gold-light text-black text-xs font-mono font-bold tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                VERIFYING...
              </>
            ) : (
              'AUTHORIZE SYSTEM LOGIN'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
