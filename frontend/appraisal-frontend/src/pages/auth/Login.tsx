import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import logo from "../../assets/logo.png"
import api from '../../api/axios'
import axios from 'axios'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [rememberMe, setRememberMe] = useState(false)

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail')
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    const handleLogin = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            })

            const user = response.data;

            localStorage.setItem("token", user.token);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", user.role);

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify({
                    userId: user.userId,
                    name: `${user.firstName} ${user.lastName}`,
                    initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
                    role: user.role,
                    managerId: user.managerId,
                    department: user.deptName,
                    token: user.token,
                    refreshToken: user.refreshToken,
                })
            );

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email)
            } else {
                localStorage.removeItem('rememberedEmail')
            }

            if (user.role === 'MANAGER') navigate('/manager/dashboard')
            else if (user.role === 'HR') navigate('/hr/dashboard')
            else if (user.role === 'EMPLOYEE' && user.firstLogin) navigate('/guide')
            else navigate('/dashboard')

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Invalid email or password')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
            <div
                className="w-full max-w-md bg-white rounded-2xl p-10 border border-gray-100"
                style={{
                    boxShadow:
                        "0 20px 60px rgba(16,137,211,0.15)"
                }}
            >
                <div className="text-center mb-5">

                    <div className="w-16 h-16 rounded-full bg-[#1089D3]/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl"><img src={logo} alt="logo" /></span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-600 mt-4">
                        Welcome Back
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Sign in to continue to Appraisova
                    </p>

                </div>

                {error && (
                    <p role="alert" className="text-red-700 text-xs text-center">{error}</p>
                )}
                <div className="flex flex-col gap-2  ">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Your Email"
                        autoComplete="email"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#1089D3] focus:ring-2 focus:ring-[#1089D3]/20 focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 mt-3">Password</label>
                    <div className="relative flex items-center">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Your Password"
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-[#1089D3] focus:ring-2 focus:ring-[#1089D3]/20 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 text-[#12B1D1] hover:text-[#1089D3] transition-colors"
                        >
                            {showPassword ? (

                                <svg className="w-5 h-5 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (

                                <svg className="w-5 h-5 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm mb-6 mt-2">

                    <label htmlFor="rememberMe" className="flex items-center gap-2 text-gray-600">
                        <input
                            id="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Remember me
                    </label>

                    <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-[#1089D3] hover:underline"
                    >
                        Forgot password
                    </button>
                </div>
                <div className="flex gap-4 mt-2">

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-3 text-sm font-semibold rounded-[20px] text-white bg-linear-to-r from-[#1089D3] to-[#12B1D1] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        style={{ boxShadow: 'rgba(133,189,215,0.878) 0px 20px 10px -15px' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Login