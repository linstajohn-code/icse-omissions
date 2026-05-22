"use client";

/**
 * AnimatedTopicList — gentle fade-in for chapter topic lists.
 *
 * Wraps the <ol> (rendered by the server page) in a motion container.
 * Server-rendered children are passed through unchanged — only the
 * entrance animation is added.
 */
import { motion } from "framer-motion";

interface AnimatedTopicListProps {
  children: React.ReactNode;
  ariaLabel?: string;
}

export function AnimatedTopicList({ children, ariaLabel }: AnimatedTopicListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <ol className="space-y-4" aria-label={ariaLabel ?? "Topics in this chapter"}>
        {children}
      </ol>
    </motion.div>
  );
}
