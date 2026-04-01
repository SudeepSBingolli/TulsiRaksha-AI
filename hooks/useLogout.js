import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // Call the logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear client-side storage
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if API call fails
      localStorage.removeItem("userId");
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
