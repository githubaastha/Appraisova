import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/authApi'
import logo from "../../assets/logo.png"

function getPasswordError(password: string): string | null {
    if (!password) return null
    if (password.length < 8) return 'Must be at least 8 characters'
    if (password.length > 32) return 'Must be under 32 characters'
    if (!/[A-Z]/.test(password)) return 'Must include an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Must include a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Must include a number'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must include a special character'
    return null
}

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [touched, setTouched] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const passwordError = getPasswordError(password)
    const confirmError = confirmPassword && confirmPassword !== password
        ? 'Passwords do not match'
        : null

    const isValid = password.length > 0 && !passwordError && !confirmError

    const handleSubmit = async () => {
        setError('')
        setTouched(true)

        if (!token) {
            setError('Invalid or missing reset link.')
            return
        }
        if (!isValid) return

        setLoading(true)
        try {
            await resetPassword(token, password)
            setSuccess(true)
            setTimeout(() => navigate('/login'), 2500)
        } catch (err: any) {
            setError(
                err.response?.data || 'This reset link is invalid or has expired.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-gray-100">
                    <p className="text-red-600 font-medium text-sm">
                        Invalid or missing reset link. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="mt-4 text-sm text-[#1089D3] font-medium hover:underline"
                    >
                        Request New Link
                    </button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="text-green-600 font-semibold text-sm">Password reset successfully!</p>
                    <p className="text-gray-400 text-xs mt-1">Redirecting to login...</p>
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
                    <h2 className="text-2xl font-bold text-gray-600">Reset Your Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter a new password for your account
                    </p>
                </div>

                {error && (
                    <p className="text-red-700 text-xs text-center mb-4">{error}</p>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative flex items-center">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder="Enter new password"
                            className={`w-full rounded-xl border px-4 py-3 pr-12 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                touched && passwordError
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                    : 'border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-[#12B1D1] hover:text-[#1089D3] transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {touched && passwordError ? (
                        <p className="text-xs text-red-500">{passwordError}</p>
                    ) : (
                        <p className="text-xs text-gray-400">
                            8–32 characters, with uppercase, lowercase, a number, and a special character
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full rounded-xl border px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            confirmError
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                : 'border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20'
                        }`}
                    />
                    {confirmError && <p className="text-xs text-red-500">{confirmError}</p>}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !isValid}
                    className="w-full mt-6 py-3 text-sm font-semibold rounded-[20px] text-white bg-linear-to-r from-[#1089D3] to-[#12B1D1] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    style={{ boxShadow: 'rgba(133,189,215,0.878) 0px 20px 10px -15px' }}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
        </div>
    )
}