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
      iconClasses: "bg-amber-50 border-stone-200 text-amber-700",
    },
    {
      id: "feat-payments",
      Icon: ShieldCheck,
      title: "Secure Payments",
      subtitle: "100% safe & secure",
      iconClasses: "bg-emerald-50 border-emerald-200 text-emerald-600",
    },
    {
      id: "feat-support",
      Icon: Headphones,
      title: "24/7 Support",
      subtitle: "We're here for you",
      iconClasses: "bg-amber-50 border-stone-200 text-amber-700",
    },
    {
      id: "feat-experience",
      Icon: Heart,
      title: "A Better Shopping Experience",
      subtitle: "Shop more, worry less",
      iconClasses: "bg-red-50 border-red-200 text-red-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />

      <div
        className="flex-1 bg-cover bg-no-repeat bg-top flex flex-col"
        style={{
          backgroundImage: `url(${homeBg})`,
        }}
      >
        <div className="px-10 py-8 max-w-184">
          <div className="bg-white rounded-2xl px-8 py-7 border border-stone-200 shadow-md mb-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-13 h-13 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center text-[1.25rem] font-bold text-amber-700 shrink-0 tracking-wider">
                {getInitials(user.fullName)}
              </div>
              <div>
                <h1 className="m-0 text-[1.2rem] font-bold text-stone-900 leading-tight">
                  Your Account
                </h1>
                <p className="m-0 text-[0.85rem] text-stone-500 mt-0.5">
                  Here's your information.
                </p>
              </div>
            </div>

            {infoRows.map((row, idx) => (
              <div key={row.id}>
                <div className="grid grid-cols-[1.5rem_9rem_1fr] items-center gap-4 py-[0.85rem]">
                  <span className="text-stone-500 flex items-center">
                    <row.Icon size={18} strokeWidth={1.5} />
                  </span>
                  <span className="text-[0.875rem] text-stone-500">{row.label}</span>
                  <span className="text-[0.875rem] text-stone-900 font-medium">{row.value}</span>
                </div>
                {idx < infoRows.length - 1 && (
                  <div className="h-px bg-stone-200" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl px-7 py-5 border border-stone-200 flex items-center gap-5 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-500 flex items-center justify-center shrink-0 text-amber-700">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="m-0 font-bold text-stone-900 text-base">
                Ready to shop?
              </p>
              <p className="m-0 mt-1 text-[0.8rem] text-stone-500 leading-normal">
                Explore amazing products, great deals<br />and more on ShopKart.
              </p>
            </div>
            <button
              id="browse-products-btn"
              onClick={() => navigate("/products")}
              className="bg-amber-700 hover:bg-amber-800 text-white border-none rounded-xl px-5 py-2.5 font-semibold text-sm cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 font-inherit transition-colors shadow-xs"
            >
              Browse Products
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="px-8 pb-3">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm grid grid-cols-4 overflow-hidden">
            {features.map((feat, idx) => (
              <div
                key={feat.id}
                className={`flex items-center gap-3.5 px-[1.4rem] py-3 ${
                  idx < features.length - 1 ? "border-r border-stone-200" : ""
                }`}
              >
                <div
                  className={`w-13 h-13 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${feat.iconClasses}`}
                >
                  <feat.Icon size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="m-0 font-semibold text-stone-900 text-[0.82rem] leading-tight">
                    {feat.title}
                  </p>
                  <p className="m-0 mt-0.5 text-stone-500 text-[0.75rem]">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
};

export default Home;
