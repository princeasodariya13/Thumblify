import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SoftBackdrop from "./SoftBackdrop";
import { useAuth } from "../context/AuthContext";

// ── step indicator ───────────────────────────────────────────
const steps = ["Email", "Verify OTP", "New Password"];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < current
                ? "bg-pink-600 text-white"
                : i === current
                ? "bg-pink-500 text-white ring-2 ring-pink-400/40 ring-offset-2 ring-offset-transparent"
                : "bg-white/10 text-white/40"
            }`}
          >
            {i < current ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`text-[10px] font-medium ${i === current ? "text-pink-400" : "text-white/30"}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`w-10 h-px mt-[-14px] transition-all duration-300 ${i < current ? "bg-pink-500" : "bg-white/10"}`} />
        )}
      </div>
    ))}
  </div>
);

// ── input field wrapper ──────────────────────────────────────
const InputField = ({
  type = "text", placeholder, value, onChange, icon, required = true,
}: {
  type?: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode; required?: boolean;
}) => (
  <div className="flex items-center w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-5 gap-2 transition-all duration-200">
    <span className="text-white/50 flex-shrink-0">{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-transparent text-white placeholder-white/40 border-none outline-none text-sm pr-4"
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="off"
    />
  </div>
);

// ── main component ───────────────────────────────────────────
const ForgetPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => { setError(""); setSuccess(""); };

  // ── STEP 0: Send OTP ──────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess("OTP sent! Check your inbox.");
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1: Verify OTP ────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otp.trim().length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const valid = await verifyOtp(email, otp.trim());
      if (valid) {
        setSuccess("OTP verified!");
        setStep(2);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Reset Password ─────────────────────────────────
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword, otp);
      setSuccess("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ── icons ─────────────────────────────────────────────────
  const EmailIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
  const OtpIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const LockIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <>
      <SoftBackdrop />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full sm:w-[420px] bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-white text-2xl font-semibold tracking-tight">Forgot Password</h1>
            <p className="text-white/40 text-sm mt-1">
              {step === 0 && "We'll send a 6-digit OTP to your email"}
              {step === 1 && `OTP sent to ${email}`}
              {step === 2 && "Create a new secure password"}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mt-6">
            <StepIndicator current={step} />
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-start gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="20 6 9 17 4 12" />
              </svg>
              {success}
            </div>
          )}

          {/* ── STEP 0: Email ── */}
          {step === 0 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <InputField
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={EmailIcon}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200"
              >
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
              <p
                onClick={() => navigate("/login")}
                className="text-center text-sm text-white/40 hover:text-white/60 cursor-pointer transition-colors"
              >
                ← Back to Login
              </p>
            </form>
          )}

          {/* ── STEP 1: OTP ── */}
          {step === 1 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <InputField
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                icon={OtpIcon}
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 rounded-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200"
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
              <p
                onClick={() => { setStep(0); clearMessages(); setOtp(""); }}
                className="text-center text-sm text-white/40 hover:text-white/60 cursor-pointer transition-colors"
              >
                ← Resend / Change email
              </p>
            </form>
          )}

          {/* ── STEP 2: Reset Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="relative flex items-center w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-5 gap-2 transition-all duration-200">
                <span className="text-white/50 flex-shrink-0">{LockIcon}</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="New password"
                  className="flex-1 bg-transparent text-white placeholder-white/40 border-none outline-none text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="pr-4 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <InputField
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={LockIcon}
              />

              {/* Password strength hint */}
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-xs text-yellow-500/70 pl-2">⚠ At least 6 characters required</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200"
              >
                {loading ? "Updating..." : "Reset Password ✓"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;