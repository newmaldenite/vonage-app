import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* Add dashboard content here */}
    </div>
  );
}
