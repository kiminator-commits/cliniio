import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      // Redirect user to login after logout
      navigate("/login", { replace: true });
    } else {
      console.error("Logout failed:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-700"
    >
      Log out
    </button>
  );
}
