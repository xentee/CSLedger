"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { getSupabaseClient } from "../lib/supabaseClient";

export default function Modal({
  type = "signin",
  onClose,
}: {
  type?: "signin" | "signup";
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(type);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      setErrorMessage(error.message);
    } else {
      console.log("Connected!");
      const token = data.session?.access_token
      if (token) localStorage.setItem('sb_access_token', token)
      handleClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-3xl bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-gray-100 rounded-lg shadow-xl overflow-hidden flex min-h-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Côté gauche avec l'image */}
            <div className="hidden md:block w-1/2">
              <img
                src="/auth-popup-image.png" // chemin depuis /public
                alt="Auth illustration"
                className="object-cover w-full h-full"
              />
            </div>

            {/* Formulaire */}
            <div className="flex-1 p-8 flex flex-col">
              <div className="flex justify-between mb-8 border-b border-indigo-800 relative">
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`relative flex-1 py-2 text-center focus:outline-none ${
                    activeTab === "signup" ? "text-white" : "text-indigo-400"
                  }`}
                >
                  Sign Up
                  {activeTab === "signup" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("signin")}
                  className={`relative flex-1 py-2 text-center focus:outline-none ${
                    activeTab === "signin" ? "text-white" : "text-indigo-400"
                  }`}
                >
                  Sign In
                  {activeTab === "signin" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
                  )}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-sm space-y-4">
                  <AnimatePresence mode="wait">
                    {activeTab === "signup" ? (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          placeholder="Username"
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm Password"
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="w-full py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition"
                        >
                          Create Account
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signin"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                        onSubmit={handleSignIn}
                      >
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-100 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="w-full py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition"
                        >
                          Log In
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-indigo-300 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
