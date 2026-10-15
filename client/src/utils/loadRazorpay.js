/**
 * Dynamically loads the Razorpay checkout script into document body.
 * Returns a Promise that resolves true if loaded, false if failed.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded on window, resolve immediately
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
