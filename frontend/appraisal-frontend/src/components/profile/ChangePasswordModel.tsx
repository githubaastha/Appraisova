import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../api/usersApi'
import { getLoggedInUser } from '../../utils/auth'

interface PasswordFormState {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

type FieldKey = keyof PasswordFormState

const FIELDS: { label: string; key: FieldKey }[] = [
  { label: 'Current Password', key: 'oldPassword' },
  { label: 'New Password',     key: 'newPassword' },
  { label: 'Confirm Password', key: 'confirmPassword' },
]

function getNewPasswordError(password: string, oldPassword: string): string | null {
  if (!password) return null
  if (password.length < 8)  return 'Must be at least 8 characters'
  if (password.length > 32) return 'Must be under 32 characters'
  if (!/[A-Z]/.test(password)) return 'Must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Must include a lowercase letter'
  if (!/[0-9]/.test(password)) return 'Must include a number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must include a special character'
  if (oldPassword && password === oldPassword) return 'Must be different from current password'
  return null
}

function getConfirmError(confirm: string, newPassword: string): string | null {
  if (!confirm) return null
  if (confirm !== newPassword) return 'Passwords do not match'
  return null
}

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { userId } = getLoggedInUser()

  const [form, setForm] = useState<PasswordFormState>({
    oldPassword: '', newPassword: '', confirmPassword: '',
  })
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    oldPassword: false, newPassword: false, confirmPassword: false,
  })
  const [visible, setVisible] = useState<Record<FieldKey, boolean>>({
    oldPassword: false, newPassword: false, confirmPassword: false,
  })
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function updateField(key: FieldKey, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setTouched(prev => ({ ...prev, [key]: true }))
    setSubmitError('')
  }

  function toggleVisible(key: FieldKey) {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const newPasswordError = getNewPasswordError(form.newPassword, form.oldPassword)
  const confirmError     = getConfirmError(form.confirmPassword, form.newPassword)

  const fieldErrors: Record<FieldKey, string | null> = {
    oldPassword: null,
    newPassword: touched.newPassword ? newPasswordError : null,
    confirmPassword: touched.confirmPassword ? confirmError : null,
  }

  const isFormValid =
    form.oldPassword.length > 0 &&
    form.newPassword.length > 0 &&
    form.confirmPassword.length > 0 &&
    !newPasswordError &&
    !confirmError

  async function handleSubmit() {
    if (!form.oldPassword) {
      setSubmitError('Current password is required.')
      return
    }
    if (!isFormValid) {
      setTouched({ oldPassword: true, newPassword: true, confirmPassword: true })
      return
    }

    setSubmitError('')
    setSubmitting(true)

    try {
      await updatePassword(userId, form.oldPassword, form.newPassword)

      // Show success state inside modal
      setSuccess(true)

      // Wait so user can read the message, then clear session + redirect to login
      setTimeout(() => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('loggedInUser')
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        navigate('/login')
      }, 2000)

    } catch (err: any) {
      setSubmitError(
        err.response?.data || 'Failed to update password. Please try again.'
      )
      setSubmitting(false)
    }
  }

  // ── Success view ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm flex flex-col items-center gap-3 shadow-lg text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800">Password updated successfully</p>
          <p className="text-xs text-gray-400">For security, you'll be logged out now. Please sign in again.</p>
        </div>
      </div>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Change Password</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {FIELDS.map(f => {
          const fieldError = fieldErrors[f.key]
          return (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">{f.label}</label>
              <div className="relative">
                <input
                  type={visible[f.key] ? 'text' : 'password'}
                  value={form[f.key]}
                  onChange={e => updateField(f.key, e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, [f.key]: true }))}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-1 transition-all
                    ${fieldError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-[#1089D3] focus:ring-[#1089D3]'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggleVisible(f.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {visible[f.key] ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {fieldError}
                </p>
              )}
            </div>
          )
        })}

        {!touched.newPassword && (
          <p className="text-[11px] text-gray-400 leading-relaxed">
            8–32 characters, with uppercase, lowercase, a number, and a special character.
          </p>
        )}

        {submitError && <p className="text-xs text-red-500">{submitError}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isFormValid && !submitting
                ? 'bg-[#1089D3] text-white hover:bg-[#0e7abf]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}