import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getInviteDetails, activateAccount } from "../../api/authApi";
import logo from "../../assets/logo.png";

// ---- helpers ----

const capitalize = (str: string) =>
    str
        ? str
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")
        : "";

const PASSWORD_RULES = {
    minLength: 8,
    maxLength: 32,
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /[0-9]/,
    symbol: /[^A-Za-z0-9]/,
};

const getPasswordStrength = (password: string): "empty" | "weak" | "medium" | "strong" => {
    if (!password) return "empty";

    const checks = [
        password.length >= PASSWORD_RULES.minLength && password.length <= PASSWORD_RULES.maxLength,
        PASSWORD_RULES.upper.test(password),
        PASSWORD_RULES.lower.test(password),
        PASSWORD_RULES.number.test(password),
        PASSWORD_RULES.symbol.test(password),
    ];

    const passedCount = checks.filter(Boolean).length;

    if (passedCount <= 2) return "weak";
    if (passedCount <= 4) return "medium";
    return "strong";
};

const isPasswordValid = (password: string) =>
    password.length >= PASSWORD_RULES.minLength &&
    password.length <= PASSWORD_RULES.maxLength &&
    PASSWORD_RULES.upper.test(password) &&
    PASSWORD_RULES.lower.test(password) &&
    PASSWORD_RULES.number.test(password) &&
    PASSWORD_RULES.symbol.test(password);

const isPhoneValid = (phone: string) => /^[6-9]\d{9}$/.test(phone.trim());

// simple inline icons (no external icon library dependency)
const PhoneIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372a1.5 1.5 0 00-1.06-1.436l-3.478-1.06a1.5 1.5 0 00-1.548.42l-.937.937a1.125 1.125 0 01-1.298.213 12.035 12.035 0 01-5.688-5.688 1.125 1.125 0 01.213-1.298l.937-.937a1.5 1.5 0 00.42-1.548l-1.06-3.478a1.5 1.5 0 00-1.436-1.06H4.5A2.25 2.25 0 002.25 6.75z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const CrossIcon = () => (
    <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface InviteDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    designation: string;
}

export default function SetupAccount() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<InviteDetails | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState<{
        firstName?: string;
        lastName?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (!token) {
            setLoadError("Invalid activation link — no token provided.");
            setLoading(false);
            return;
        }

        getInviteDetails(token)
            .then((data) => {
                setDetails(data);
                setFirstName(capitalize(data.firstName));
                setLastName(capitalize(data.lastName));
                setPhone(data.phone || "");
            })
            .catch((err) => {
                setLoadError(
                    err.response?.data?.message ||
                        "This invite link is invalid or has expired."
                );
            })
            .finally(() => setLoading(false));
    }, [token]);

    const phoneValid = phone.length === 0 ? null : isPhoneValid(phone);
    const passwordStrength = getPasswordStrength(password);
    const passwordValid = isPasswordValid(password);
    const passwordsMatch =
        confirmPassword.length === 0 ? null : password === confirmPassword;

    const strengthConfig = {
        empty: { label: "", color: "bg-gray-200", width: "w-0", text: "text-gray-400" },
        weak: { label: "Weak", color: "bg-red-400", width: "w-1/3", text: "text-red-500" },
        medium: { label: "Medium", color: "bg-amber-400", width: "w-2/3", text: "text-amber-600" },
        strong: { label: "Strong", color: "bg-green-500", width: "w-full", text: "text-green-600" },
    };

    const validateAll = () => {
        const errors: typeof fieldErrors = {};

        if (!firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!isPhoneValid(phone)) {
            errors.phone = "Enter a valid 10-digit phone number";
        }

        if (!password) {
            errors.password = "Password is required";
        } else if (!isPasswordValid(password)) {
            errors.password =
                "Must be 8-32 characters with uppercase, lowercase, number & symbol";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError("");
        setTouched({ firstName: true, lastName: true, phone: true, password: true, confirmPassword: true });

        if (!validateAll()) return;

        setSubmitting(true);
        try {
            await activateAccount(token, firstName.trim(), lastName.trim(), phone.trim(), password);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err: any) {
            setSubmitError(
                err.response?.data || err.response?.data?.message || "Failed to activate account"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100">
                <p className="text-gray-500 text-sm">Loading your invite details...</p>
            </div>
        );
    }

    if (loadError && !details) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-gray-100">
                    <p className="text-red-600 font-medium text-sm">{loadError}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <CheckIcon />
                    </div>
                    <p className="text-green-600 font-semibold text-sm">
                        Account activated successfully!
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 px-4 py-0 mt-0">
            <div
                className="w-full max-w-lg bg-white rounded-2xl px-8  sm:p-10 border border-gray-100"
                style={{ boxShadow: "0 20px 60px rgba(16,137,211,0.15)" }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#1089D3]/10 flex items-center justify-center mx-auto mb-2">
                        <img src={logo} alt="logo" className="w-14 h-12 object-contain" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">
                        Complete Your Account
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Review your details and set a password to get started with Appraisova
                    </p>
                </div>

                {submitError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-6">
                        <p className="text-red-600 text-xs text-center">{submitError}</p>
                    </div>
                )}

                {/* Editable identity fields */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-6">
                        Your Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 mt-2 block">
                                First Name
                            </label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                                    touched.firstName && fieldErrors.firstName
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20"
                                }`}
                            />
                            {touched.firstName && fieldErrors.firstName && (
                                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.firstName}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 mt-2 block">
                                Last Name
                            </label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                                    touched.lastName && fieldErrors.lastName
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20"
                                }`}
                            />
                            {touched.lastName && fieldErrors.lastName && (
                                <p className="text-xs text-red-500 mt-1.5">{fieldErrors.lastName}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Read-only fields */}
                <div className="mb-4 ">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                                Email
                            </label>
                            <div className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-600">
                                {details?.email}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                                Role
                            </label>
                            <div className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-600">
                                {capitalize(details?.role || "")}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                                Designation
                            </label>
                            <div className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-600">
                                {capitalize(details?.designation || "")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable security fields */}
                <div className="flex flex-col gap-4">
                    {/* Phone */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Phone Number
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5">
                                <PhoneIcon />
                            </span>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                placeholder="Enter phone number"
                                className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                    touched.phone && phoneValid === false
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : touched.phone && phoneValid
                                        ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                                        : "border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20"
                                }`}
                            />
                            {touched.phone && phoneValid !== null && (
                                <span className="absolute right-3.5">
                                    {phoneValid ? <CheckIcon /> : <CrossIcon />}
                                </span>
                            )}
                        </div>
                        {touched.phone && fieldErrors.phone && (
                            <p className="text-xs text-red-500 mt-1.5">{fieldErrors.phone}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Set Password
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5">
                                <LockIcon />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                placeholder="Create a strong password"
                                className={`w-full rounded-xl border pl-10 pr-11 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                    touched.password && password && !passwordValid
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : touched.password && passwordValid
                                        ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                                        : "border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 text-[#12B1D1] hover:text-[#1089D3] transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Strength meter */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color} ${strengthConfig[passwordStrength].width}`}
                                    />
                                </div>
                                <p className={`text-xs mt-1 font-medium ${strengthConfig[passwordStrength].text}`}>
                                    {strengthConfig[passwordStrength].label}
                                </p>
                            </div>
                        )}

                        {touched.password && fieldErrors.password ? (
                            <p className="text-xs text-red-500 mt-1.5">{fieldErrors.password}</p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-1.5">
                                8-32 characters, with uppercase, lowercase, number & symbol
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Confirm Password
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5">
                                <LockIcon />
                            </span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                                placeholder="Re-enter your password"
                                className={`w-full rounded-xl border pl-10 pr-11 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                    touched.confirmPassword && confirmPassword && !passwordsMatch
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : touched.confirmPassword && passwordsMatch
                                        ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                                        : "border-gray-300 focus:border-[#1089D3] focus:ring-[#1089D3]/20"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 text-[#12B1D1] hover:text-[#1089D3] transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {touched.confirmPassword && fieldErrors.confirmPassword ? (
                            <p className="text-xs text-red-500 mt-1.5">{fieldErrors.confirmPassword}</p>
                        ) : (
                            touched.confirmPassword &&
                            passwordsMatch && (
                                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                                    <CheckIcon /> Passwords match
                                </p>
                            )
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 mt-2 text-sm font-semibold rounded-[20px] text-white bg-linear-to-r from-[#1089D3] to-[#12B1D1] hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                        style={{ boxShadow: "rgba(133,189,215,0.6) 0px 12px 24px -8px" }}
                    >
                        {submitting ? "Activating..." : "Activate Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}