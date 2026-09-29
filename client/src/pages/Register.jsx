import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import heroImg from "../assets/register_hero.png";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/customers/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      <div
        className="hidden lg:block w-[50%] shrink-0 relative overflow-hidden"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "left top",
        }}
      />

      <div
        className="flex flex-1 items-center justify-center px-8 py-6"
        style={{ backgroundColor: "#FAF7F2" }}
      >
        <div className="w-full max-w-112.5 bg-white rounded-2xl shadow-lg px-10 py-7">
          <p className="text-xs font-bold tracking-[2.5px] uppercase text-amber-600 mb-2.5">
            Create Your Account
          </p>

          <h2 className="text-[28px] font-extrabold text-stone-900 tracking-tight mb-1.5">
            Join ShopKart today
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Start your shopping journey with us
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3 mb-4 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-800 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="w-full border-[1.5px] border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-800 bg-stone-50 placeholder-stone-300 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-stone-800 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="w-full border-[1.5px] border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-800 bg-stone-50 placeholder-stone-300 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-stone-800 mb-1.5">
                Mobile number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  required
                  className="w-full border-[1.5px] border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-800 bg-stone-50 placeholder-stone-300 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-stone-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full border-[1.5px] border-stone-200 rounded-xl pl-10 pr-11 py-3 text-sm text-stone-800 bg-stone-50 placeholder-stone-300 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17.94 17.94A10.07 10.07 0 0112 20c-5.523 0-10-4.477-10-8 0-1.274.402-2.46 1.06-3.47M6.53 6.53A9.97 9.97 0 0112 4c5.523 0 10 4.477 10 8a9.96 9.96 0 01-2.343 6.343M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#B45309] hover:bg-[#92400e] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[15px] py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(180,83,9,0.30)] hover:shadow-[0_6px_20px_rgba(146,64,14,0.38)] cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <hr className="border-stone-100 mt-5 mb-4" />

          <p className="text-center text-stone-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              replace
              className="text-amber-700 hover:text-amber-800 font-bold transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
