import React, { useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import Auth from "./Auth.jsx";
import App from "./App.jsx";

export default function Root() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Demo mode: no Supabase configured — run the app without login
  if (!supabase) return <App />;

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <p className="text-[13px] text-[#6B7680] font-['Inter']">Loading your books...</p>
      </div>
    );
  }

  if (!session) return <Auth />;

  return <App session={session} onSignOut={() => supabase.auth.signOut()} />;
}
