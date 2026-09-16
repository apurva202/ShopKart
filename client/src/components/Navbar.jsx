import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Home,
  LayoutGrid,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Get initials from full name
const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (err) {
      console.log(err);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-[#E5DED5] shadow-[0_1px_8px_rgba(0,0,0,0.06)] px-7 py-3 flex items-center gap-6 sticky top-0 z-50 font-sans box-border">
      {/* ── Logo — text only ── */}
      <Link
        to="/home"
        className="flex items-center no-underline shrink-0"
      >
        <span className="text-[1.35rem] font-extrabold tracking-[-0.01em]">
          <span className="text-[#292524]">Shop</span>
          <span className="text-[#D97706]">Kart</span>
        </span>
      </Link>

      {/* ── Nav Links ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Home — active */}
        <Link
          to="/home"
          className="flex items-center gap-[0.35rem] px-[0.85rem] py-[0.4rem] rounded-lg bg-[#FEF3E2] border border-[#E5DED5] no-underline text-[0.875rem] font-semibold text-[#B45309]"
        >
          <Home size={15} strokeWidth={2} />
          Home
        </Link>

        {/* Products — static, no route yet */}
        <span className="flex items-center gap-[0.35rem] px-[0.85rem] py-[0.4rem] rounded-lg text-[0.875rem] font-medium text-[#78716C] cursor-default">
          <LayoutGrid size={15} strokeWidth={2} />
          Products
        </span>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex-1 flex items-center gap-[0.6rem] bg-[#FAF7F2] border border-[#E5DED5] rounded-full px-4 py-[0.45rem]">
        <Search size={15} color="#78716C" strokeWidth={2} />
        <input
          id="navbar-search"
          type="text"
          placeholder="Search for products, brands and more..."
          className="flex-1 border-none bg-transparent outline-none text-[0.85rem] text-[#292524] placeholder:text-[#78716C] font-inherit"
        />
      </div>

      {/* ── Right Side ── */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Static Cart Icon */}
        <div className="relative cursor-default">
          <ShoppingCart size={24} color="#292524" strokeWidth={1.8} />
          <span className="absolute top-[-0.45rem] right-[-0.45rem] bg-[#D97706] text-white rounded-full w-[1.1rem] h-[1.1rem] flex items-center justify-center text-[0.6rem] font-bold">
            0
          </span>
        </div>

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer px-[0.4rem] py-[0.2rem] rounded-lg font-inherit"
          >
            {/* Avatar */}
            <div className="w-[2.1rem] h-[2.1rem] rounded-full bg-[#FEF3E2] border-2 border-[#D97706] flex items-center justify-center text-[0.75rem] font-bold text-[#B45309] shrink-0">
              {user ? getInitials(user.fullName) : "?"}
            </div>
            <span className="text-[0.875rem] font-medium text-[#292524]">
              Hi, {user?.fullName?.split(" ")[0]}
            </span>
            <ChevronDown
              size={14}
              color="#78716C"
              strokeWidth={2.5}
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute top-[calc(100%+0.6rem)] right-0 bg-white border border-[#E5DED5] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] min-w-52 overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF3E2] border-2 border-[#D97706] flex items-center justify-center text-[0.8rem] font-bold text-[#B45309] shrink-0">
                  {user ? getInitials(user.fullName) : "?"}
                </div>
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-[#292524] text-[0.875rem] truncate">
                    {user?.fullName}
                  </p>
                  <p className="m-0 text-[#78716C] text-[0.75rem] truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E5DED5]" />

              {/* Logout row */}
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center gap-[0.65rem] px-4 py-3 bg-transparent hover:bg-[#FAF7F2] border-none cursor-pointer text-[0.875rem] text-[#292524] font-inherit text-left transition-colors"
              >
                <LogOut size={16} color="#78716C" strokeWidth={2} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
