// Purpose: server componenet for admin login page that displays the login form - server component- runs on the server, not in the browser an can access server-only resources (DBs, backend APIs, secret envs, filesystem)
export const metadata = {
  robots: "noindex, nofollow",
}; // Meta Tag : Directly tells search engines not to index.
export const dynamic = "force-dynamic"; // Prevents static generation
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
