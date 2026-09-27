import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle,
  PackageOpen,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "Electronics", label: "Electronics" },
  { id: "Fashion", label: "Fashion" },
  { id: "Books", label: "Books" },
  { id: "Home", label: "Home" },
  { id: "Fitness", label: "Fitness" },
  { id: "Beauty", label: "Beauty" },
];

const ITEMS_PER_PAGE = 8; // 4x2 grid to match mockup

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Ref for auto-scrolling to top on pagination change
  const cardsContainerRef = useRef(null);

  // Auto-scroll cards container to top when page changes
  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Debounce search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products from backend API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (category && category !== "all") {
        params.category = category;
      }
      if (sort === "price_asc" || sort === "price_desc") {
        params.sort = sort;
      }

      const res = await api.get("/products", { params });
      if (res.data && res.data.success) {
        setProducts(res.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, category, sort]);

  // Apply client-side availability filter
  const filteredProducts = useMemo(() => {
    if (!inStockOnly) return products;
    return products.filter((p) => p.stock > 0);
  }, [products, inStockOnly]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setSort("featured");
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    setToastMessage(`"${product.name}" added to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="bg-[#FAF7F2] h-screen flex flex-col font-sans text-[#1C1917] overflow-hidden">
      {/* ── Existing Navbar ── */}
      <Navbar />

      {/* ── Main Container (Fixed viewport height) ── */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 pt-6 pb-2 min-h-0 overflow-hidden box-border">
        {/* ── Page Header: Title + Search & Sort (Fixed) ── */}
        <div className="shrink-0 flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
          {/* Title and Subtitle */}
          <div>
            <h1 className="m-0 font-serif text-[2.25rem] sm:text-[2.6rem] font-bold text-[#1C1917] tracking-tight leading-none">
              Products
            </h1>
            <p className="m-0 text-[#78716C] text-sm sm:text-base mt-1.5">
              Find something you’ll love.
            </p>
          </div>

          {/* Controls: Search Bar + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80 md:w-96 flex items-center bg-white border border-[#E5DED5] rounded-xl px-3.5 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.03)] focus-within:border-[#D97706] focus-within:ring-1 focus-within:ring-[#D97706] transition-all">
              <Search size={17} className="text-[#78716C] shrink-0 mr-2.5" />
              <input
                id="products-search-input"
                type="text"
                placeholder="Search products, brands and more..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-[#1C1917] placeholder:text-[#A8A29E] font-inherit"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="bg-transparent border-none text-xs text-[#A8A29E] hover:text-[#292524] cursor-pointer p-0 ml-1 font-inherit"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                id="products-sort-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-[#E5DED5] rounded-xl pl-3.5 pr-9 py-2 text-sm font-medium text-[#1C1917] shadow-[0_1px_4px_rgba(0,0,0,0.03)] focus:outline-none focus:border-[#D97706] cursor-pointer font-inherit"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price_asc">Sort by: Price: Low to High</option>
                <option value="price_desc">Sort by: Price: High to Low</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[15.5rem_1fr] gap-8 items-start min-h-0 overflow-hidden pb-1">
          {/* ── Left Sidebar (Fixed Filters) ── */}
          <aside className="bg-white rounded-2xl border border-[#E5DED5] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] shrink-0 overflow-y-auto max-h-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E5DED5] [&::-webkit-scrollbar-thumb]:rounded-full">
            <h2 className="m-0 text-base font-bold text-[#1C1917] mb-4 tracking-tight">
              Filters
            </h2>

            {/* Category Filter */}
            <div>
              <h3 className="m-0 text-sm font-semibold text-[#1C1917] mb-2.5">
                Category
              </h3>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all border-none font-inherit cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#FEF3E2] text-[#B45309] font-semibold"
                          : "bg-transparent text-[#57534E] hover:bg-[#FAF7F2] font-normal"
                      }`}
                    >
                      {/* Custom Radio Button */}
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                          isSelected ? "border-[#D97706]" : "border-[#D6D3D1]"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                        )}
                      </span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E5DED5] my-4" />

            {/* Availability Filter */}
            <div>
              <h3 className="m-0 text-sm font-semibold text-[#1C1917] mb-2.5">
                Availability
              </h3>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#57534E] select-none py-1">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    inStockOnly
                      ? "bg-[#B45309] border-[#B45309] text-white"
                      : "bg-white border-[#D6D3D1]"
                  }`}
                >
                  {inStockOnly && <Check size={12} strokeWidth={3} />}
                </span>
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E5DED5] my-4" />

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full py-2 px-3 border border-[#D97706] text-[#B45309] hover:bg-[#FEF3E2] rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer bg-transparent font-inherit"
            >
              <RotateCcw size={14} strokeWidth={2} />
              <span>Clear Filters</span>
            </button>
          </aside>

          {/* ── Right Content Area ── */}
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            {/* Products Count Indicator (Fixed above red line) */}
            <div className="mb-3 shrink-0 flex items-center justify-between">
              <span className="text-sm text-[#78716C] font-medium">
                {loading
                  ? "Loading products..."
                  : `Showing ${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "product" : "products"
                    }`}
              </span>
            </div>

            {/* ── Scrollable Card Area (Under Red Line) ── */}
            <div
              ref={cardsContainerRef}
              className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E5DED5] [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {/* ── State 1: Loading Skeleton ── */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-[#E5DED5] p-3.5 flex flex-col justify-between animate-pulse"
                    >
                      <div className="w-full aspect-4/3 bg-[#E7E5E4] rounded-xl" />
                      <div className="mt-3">
                        <div className="h-4 bg-[#E7E5E4] rounded w-3/4 mb-2" />
                        <div className="h-3 bg-[#E7E5E4] rounded w-1/3 mb-3" />
                        <div className="h-5 bg-[#E7E5E4] rounded w-1/2 mb-2" />
                        <div className="h-3 bg-[#E7E5E4] rounded w-1/4" />
                      </div>
                      <div className="h-9 bg-[#E7E5E4] rounded-xl mt-3.5" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── State 2: Error State ── */}
              {!loading && error && (
                <div className="bg-white rounded-2xl border border-[#FECACA] p-8 text-center my-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="m-0 text-lg font-bold text-[#292524]">
                    Something went wrong while loading products.
                  </h3>
                  <p className="m-0 text-sm text-[#78716C] mt-1 mb-4">
                    Please check your connection and try again.
                  </p>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    className="bg-[#B45309] text-white border-none px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#92400E] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* ── State 3: Empty State ── */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#E5DED5] p-12 text-center my-6 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#FEF3E2] border border-[#E5DED5] flex items-center justify-center text-[#B45309] mb-4">
                    <PackageOpen size={30} strokeWidth={1.5} />
                  </div>
                  <h3 className="m-0 text-xl font-bold text-[#292524]">
                    No products found.
                  </h3>
                  <p className="m-0 text-sm text-[#78716C] mt-1.5 max-w-sm">
                    We couldn't find any products matching your search or
                    filters. Try adjusting them.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-5 bg-[#B45309] text-white border-none px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#92400E] transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* ── State 4: Products Grid ── */}
              {!loading && !error && paginatedProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {paginatedProducts.map((prod) => (
                      <ProductCard
                        key={prod._id}
                        product={prod}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {/* ── Centered Pagination Controls ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10 mb-2">
                      {/* Previous Button */}
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        aria-label="Previous page"
                        className="w-9 h-9 rounded-xl border border-[#E5DED5] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#D6D3D1] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-inherit"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-xl font-semibold text-sm flex items-center justify-center transition-all border-none font-inherit cursor-pointer ${
                              isActive
                                ? "bg-[#B45309] text-white shadow-sm"
                                : "border border-[#E5DED5] bg-white text-[#57534E] hover:bg-[#FAF7F2]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        aria-label="Next page"
                        className="w-9 h-9 rounded-xl border border-[#E5DED5] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#D6D3D1] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-inherit"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Toast Feedback Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#292524] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 text-sm font-medium animate-bounce">
          <Check size={16} className="text-[#16A34A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Products;
