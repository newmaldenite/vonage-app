// Purpose: Client component for admin dashbaord content
"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";

interface AdminDashboardContentProps {
    user: User;
}

export default function AdminDashboardContent({ user }: AdminDashboardContentProps) {
    return (
        <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Admin Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admin ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
        </div>
      </div>
      
      {/* Add your admin functionality here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Admin Controls</h2>
        <p>Your admin controls and functionality will go here.</p>
      </div>
    </div>
    )
}