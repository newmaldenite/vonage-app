// File path: scripts/create-first-admin.js
// Purpose: Utility script to create the first admin user in your system

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Supabase URL and service role key are required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFirstAdmin(email: string): Promise<void> {
  // First, check if the user exists
  const { data: existingUser, error: userError } = await supabase
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .single();

  let userId;

  if (userError || !existingUser) {
    // Create the user if they don't exist
    console.log("User not found, creating new user...");
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { role: "admin" },
      });

    if (createError) {
      console.error("Error creating user:", createError);
      return;
    }

    userId = newUser.user.id;
    console.log("Created new user with ID:", userId);
  } else {
    userId = existingUser.id;
    console.log("Found existing user with ID:", userId);

    // Update user metadata to include admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { role: "admin" },
      },
    );

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      return;
    }
    console.log("Updated user metadata to include admin role");
  }

  // Add user to admins table
  console.log("Adding user to admins table as superadmin...");
  const { error: adminError } = await supabase.from("admins").upsert({
    user_id: userId,
    is_superadmin: true, // First admin is a superadmin
  });

  if (adminError) {
    console.error("Error adding admin:", adminError);
    return;
  }

  console.log(`Successfully created admin user: ${email}`);
  console.log(`This user now has superadmin privileges.`);
}

// Usage - Node.js script via command line to get the admin email
const adminEmail = process.argv[2];
if (!adminEmail) {
  console.error("Please provide an admin email address");
  process.exit(1);
}

// call the fucntion with the extracted admin email
createFirstAdmin(adminEmail)
  .catch(console.error)
  .finally(() => process.exit(0));
