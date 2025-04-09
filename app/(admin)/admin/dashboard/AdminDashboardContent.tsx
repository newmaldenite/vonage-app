// Purpose: Client component for admin dashbaord content
"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";

interface AdminDashboardContentProps {
  user: User;
}

export default function AdminDashboardContent({
  user,
}: AdminDashboardContentProps) {
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
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Security Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Authentication Status Widget */}
            {/* moved from /vonage-app/app/dashboard/page.tsx  */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                Authentication Status
              </h2>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold">95%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                  <p className="text-2xl font-semibold">120</p>
                </div>
              </div>
            </div>
            User Activity Widget
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">User Activity</h2>
              <p className="text-gray-500">Activity chart will go here</p>
            </div>
            {/* Add more widgets as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
