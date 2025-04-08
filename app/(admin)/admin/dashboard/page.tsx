// Purpose: Server component for admin dashbaord that checks authentication and displays admin content

import { isAdmin } from "@/lib/auth/admin"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import AdminDashboardContent from "./AdminDashboardContent";

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
        redirect("/admin/login");
    }

    // Check if user is an admin
    const adminStatus = await isAdmin();
    if (!adminStatus){
        redirect("/admin/login?error=Unauthorized: Admin access required");
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <AdminDashboardContent user={user} />
        </div>
    )

}