import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/authApi'
import logo from "../../assets/logo.png"

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        setError('')

        if (!email.trim()) {
            setError('Please enter your email address')
            return
        }

        setLoading(true)
        try {
            await forgotPassword(email.trim())
            setSubmitted(true)
        } catch (err: any) {
            // Even on error, we don't reveal whether the email exists —
            // only genuine failures (network, server down) show an error here
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
                <div
                    className="w-full max-w-md bg-white rounded-2xl p-10 border border-gray-100 text-center"
                    style={{ boxShadow: "0 20px 60px rgba(16,137,211,0.15)" }}
                >
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">Check Your Email</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-6 text-sm text-[#1089D3] font-medium hover:underline"
                    >
                        ← Back to Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
            <div
                className="w-full max-w-md bg-white rounded-2xl p-10 border border-gray-100"
                style={{ boxShadow: "0 20px 60px rgba(16,137,211,0.15)" }}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#1089D3]/10 flex items-center justify-center mx-auto mb-4">
                        <img src={logo} alt="logo" className="w-9 h-9 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-600">Forgot Password?</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter your email and we'll send you a link to reset it
                    </p>
                </div>

                {error && (
                    <p className="text-red-700 text-xs text-center mb-4">{error}</p>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Enter Your Email"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#1089D3] focus:ring-2 focus:ring-[#1089D3]/20 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-6 py-3 text-sm font-semibold rounded-[20px] text-white bg-linear-to-r from-[#1089D3] to-[#12B1D1] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    style={{ boxShadow: 'rgba(133,189,215,0.878) 0px 20px 10px -15px' }}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                    onClick={() => navigate('/login')}
                    className="w-full mt-4 text-sm text-gray-500 hover:text-[#1089D3] transition-colors"
                >
                    ← Back to Sign In
                </button>
            </div>
        </div>
    )
}