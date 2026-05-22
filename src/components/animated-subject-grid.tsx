"use client";

/**
 * AnimatedSubjectGrid — staggered card entrance for subject grids.
 *
 * Accepts serializable subject data + class from server components.
 * Renders SubjectCard items wrapped in motion.div for stagger animation.
 */
import { motion } from "framer-motion";
import { SubjectCard } from "@/components/subject-card";
import type { SubjectSummary } from "@/lib/data";

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

interface AnimatedSubjectGridProps {
  subjects: SubjectSummary[];
  icseClass: 9 | 10;
}

export function AnimatedSubjectGrid({ subjects, icseClass }: AnimatedSubjectGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {subjects.map((subject) => (
        <motion.div key={subject.slug} variants={itemVariants}>
          <SubjectCard subject={subject} icseClass={icseClass} />
        </motion.div>
      ))}
    </motion.div>
  );
}
