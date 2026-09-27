import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import homeBg from "../assets/home.png";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Heart,
} from "lucide-react";

// Format: "14 Sep 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Get initials from full name (e.g. "Apurva Patil" → "AP")
const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const memberSince = formatDate(user.createdAt);

  const infoRows = [
    { id: "full-name", label: "Full Name",    value: user.fullName,   Icon: User        },
    { id: "email",     label: "Email",        value: user.email,      Icon: Mail        },
    { id: "phone",     label: "Phone",        value: user.phone,      Icon: Phone       },
    ...(memberSince
      ? [{ id: "member-since", label: "Member Since", value: memberSince, Icon: CalendarDays }]
      : []),
  ];

  const features = [
    {
      id: "feat-delivery",
      Icon: Truck,
      title: "Fast & Reliable Delivery",
      subtitle: "On-time, every time",
      iconBg: "#FEF3E2",
      iconBorder: "#E5DED5",
      iconColor: "#B45309",
    },
    {
      id: "feat-payments",
      Icon: ShieldCheck,
      title: "Secure Payments",
      subtitle: "100% safe & secure",
      iconBg: "#DCFCE7",
      iconBorder: "#BBF7D0",
      iconColor: "#16A34A",
    },
    {
      id: "feat-support",
      Icon: Headphones,
      title: "24/7 Support",
      subtitle: "We're here for you",
      iconBg: "#FEF3E2",
      iconBorder: "#E5DED5",
      iconColor: "#B45309",
    },
    {
      id: "feat-experience",
      Icon: Heart,
      title: "A Better Shopping Experience",
      subtitle: "Shop more, worry less",
      iconBg: "#FEE2E2",
      iconBorder: "#FECACA",
      iconColor: "#DC2626",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">

      {/* Navbar — sits above the bg */}
      <Navbar />

      {/* Content area — bg image only here */}
      <div
        className="flex-1 bg-cover bg-no-repeat flex flex-col"
        style={{
          backgroundImage: `url(${homeBg})`,
          backgroundPosition: "top center",
        }}
      >

        {/* Cards — left-aligned, overlaid on bg */}
        <div className="px-10 py-8 max-w-184">

          {/* ── Profile Card ── */}
          <div className="bg-white rounded-2xl px-8 py-7 border border-[#E5DED5] shadow-[0_8px_32px_rgba(0,0,0,0.10)] mb-5">
            {/* Header: avatar + title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-13 h-13 rounded-full bg-[#FEF3E2] border-2 border-[#D97706] flex items-center justify-center text-[1.25rem] font-bold text-[#B45309] shrink-0 tracking-wider">
                {getInitials(user.fullName)}
              </div>
              <div>
                <h1 className="m-0 text-[1.2rem] font-bold text-[#292524] leading-tight">
                  Your Account
                </h1>
                <p className="m-0 text-[0.85rem] text-[#78716C] mt-0.5">
                  Here's your information.
                </p>
              </div>
            </div>

            {/* Info rows */}
            {infoRows.map((row, idx) => (
              <div key={row.id}>
                <div className="grid grid-cols-[1.5rem_9rem_1fr] items-center gap-4 py-[0.85rem]">
                  <span className="text-[#78716C] flex items-center">
                    <row.Icon size={18} strokeWidth={1.5} />
                  </span>
                  <span className="text-[0.875rem] text-[#78716C]">{row.label}</span>
                  <span className="text-[0.875rem] text-[#292524] font-medium">{row.value}</span>
                </div>
                {idx < infoRows.length - 1 && (
                  <div className="h-px bg-[#E5DED5]" />
                )}
              </div>
            ))}
          </div>

          {/* ── CTA Card ── */}
          <div className="bg-[#FEF3E2] rounded-2xl px-7 py-5 border border-[#E5DED5] flex items-center gap-5 shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
            <div className="w-12 h-12 rounded-full bg-[#FDE8C8] border border-[#D97706] flex items-center justify-center shrink-0 text-[#B45309]">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="m-0 font-bold text-[#292524] text-base">
                Ready to shop?
              </p>
              <p className="m-0 mt-1 text-[0.8rem] text-[#78716C] leading-normal">
                Explore amazing products, great deals<br />and more on ShopKart.
              </p>
            </div>
            <button
              id="browse-products-btn"
              onClick={() => navigate("/products")}
              className="bg-[#B45309] hover:bg-[#92400E] text-white border-none rounded-[0.6rem] px-[1.3rem] py-[0.65rem] font-semibold text-[0.875rem] cursor-pointer flex items-center gap-[0.45rem] whitespace-nowrap shrink-0 font-inherit transition-colors"
            >
              Browse Products
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Features Strip ── */}
        <div className="px-8 pb-3">
          <div className="bg-white border border-[#E5DED5] rounded-[0.875rem] shadow-[0_2px_16px_rgba(0,0,0,0.08)] grid grid-cols-4 overflow-hidden">
            {features.map((feat, idx) => (
              <div
                key={feat.id}
                className={`flex items-center gap-3.5 px-[1.4rem] py-3 ${
                  idx < features.length - 1 ? "border-r border-[#E5DED5]" : ""
                }`}
              >
                <div
                  className="w-13 h-13 rounded-full border-[1.5px] flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: feat.iconBg,
                    borderColor: feat.iconBorder,
                    color: feat.iconColor,
                  }}
                >
                  <feat.Icon size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="m-0 font-semibold text-[#292524] text-[0.82rem] leading-tight">
                    {feat.title}
                  </p>
                  <p className="m-0 mt-0.5 text-[#78716C] text-[0.75rem]">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer Quote — right below features, dark text ── */}
        <div className="text-center px-4 py-3.5 pb-5">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 max-w-20 h-px bg-black" />
            <p className="m-0 italic text-black text-[0.9rem]">
              &ldquo;Good things, closer to you.&rdquo;
            </p>
            <div className="flex-1 max-w-20 h-px bg-black" />
          </div>
          <p className="m-0 mt-1 text-black text-[0.78rem] font-medium">
            — ShopKart
          </p>
        </div>

      </div>
      {/* end bg-image content area */}
    </div>
  );
};

export default Home;
