"use client";

import { AnimatePresence, motion } from "framer-motion";

export function FormError({ message }: { message?: string | null }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={message}
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 6 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden text-xs font-medium text-destructive"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
