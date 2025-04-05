// File: /app/auth-debug/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function AuthDebugPage() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Get session data
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p className="text-lg">
          User: {user ? "✅ Authenticated" : "❌ Not authenticated"}
        </p>
        <p className="text-lg">Session: {session ? "✅ Active" : "❌ None"}</p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            <p>Error: {error.message}</p>
          </div>
        )}
      </div>

      {user && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Details</h2>
          <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-80">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {session && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Session Details</h2>
          <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-80">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
