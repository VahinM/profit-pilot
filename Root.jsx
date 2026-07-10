import React, { useState } from "react";
import { supabase } from "./lib/supabase";

const inputCls =
  "w-full text-[14px] border border-[#E7E1D4] rounded-lg px-3.5 py-2.5 outline-none bg-white focus:border-[#1C2B33] transition-colors";

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'ok', text }

  const submit = async (e) => {
    e.preventDefault();
    if (!supabase) { setMessage({ type: "error", text: "Accounts aren't set up yet." }); return; }
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { business_name: businessName || "My business" } },
        });
        if (error) throw error;
        setMessage({ type: "ok", text: "Account created. Check your email to confirm, then log in." });
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // App.jsx listens for the session change and takes over from here.
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ type: "ok", text: "Reset link sent. Check your email." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: ["Welcome back", "Log in to your books."],
    signup: ["Start with ProfitPilot", "Set up your business in under a minute."],
    reset: ["Reset password", "We'll email you a reset link."],
  };
  const [title, subtitle] = titles[mode];

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center font-['Inter'] p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-md bg-[#D4A24C] flex items-center justify-center">
            <span className="font-['Roboto_Slab'] text-[14px] text-[#1C2B33] font-semibold">P</span>
          </div>
          <span className="font-['Roboto_Slab'] text-[17px] text-[#1C2B33]">ProfitPilot</span>
        </div>

        <div className="relative bg-[#FFFDF9] rounded-xl border border-[#E7E1D4] shadow-[0_1px_2px_rgba(28,43,51,0.04)] p-7 pt-8">
          <div
            className="absolute -top-[1px] left-0 right-0 h-2 overflow-hidden rounded-t-xl"
            style={{
              backgroundImage: "radial-gradient(circle at 6px 0px, transparent 4px, #FFFDF9 4.5px)",
              backgroundSize: "12px 8px",
              backgroundRepeat: "repeat-x",
            }}
          />
          <h1 className="font-['Roboto_Slab'] text-xl text-[#1C2B33] mb-1">{title}</h1>
          <p className="text-[13px] text-[#6B7680] mb-6">{subtitle}</p>

          {message && (
            <div
              className={`text-[13px] px-3.5 py-2.5 rounded-lg mb-4 ${
                message.type === "error"
                  ? "bg-[#F8E9E4] text-[#B5533C]"
                  : "bg-[#E8F3EC] text-[#1F7A5C]"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="text-[12px] text-[#6B7680] block mb-1.5">Business name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Maple & Thyme Kitchen"
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                className={inputCls}
              />
            </div>
            {mode !== "reset" && (
              <div>
                <label className="text-[12px] text-[#6B7680] block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputCls}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C2B33] text-white text-[14px] font-medium py-2.5 rounded-lg hover:bg-[#243944] transition-colors disabled:opacity-60"
            >
              {loading
                ? "One moment..."
                : mode === "login"
                ? "Log in"
                : mode === "signup"
                ? "Create account"
                : "Send reset link"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#EFEADD] text-center text-[13px] text-[#6B7680] space-y-1.5">
            {mode === "login" && (
              <>
                <p>
                  New here?{" "}
                  <button onClick={() => { setMode("signup"); setMessage(null); }} className="text-[#8A6A2E] font-medium hover:underline">
                    Create an account
                  </button>
                </p>
                <p>
                  <button onClick={() => { setMode("reset"); setMessage(null); }} className="text-[#8A6A2E] font-medium hover:underline">
                    Forgot password?
                  </button>
                </p>
              </>
            )}
            {mode !== "login" && (
              <p>
                <button onClick={() => { setMode("login"); setMessage(null); }} className="text-[#8A6A2E] font-medium hover:underline">
                  Back to log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
