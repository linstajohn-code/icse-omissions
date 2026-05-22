"use client";

/**
 * HomeHero — client component for the homepage.
 *
 * Receives pre-computed stats from the server page and renders the
 * cinematic editorial layout with framer-motion entrance animations.
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { ExamCountdown } from "@/components/exam-countdown";

interface ClassStats {
  subjects: number;
  topics: number;
  omitted: number;
  partial: number;
}

interface HomeHeroProps {
  stats9: ClassStats;
  stats10: ClassStats;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.1, ease: "easeOut" as const },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: "destructive" | "amber";
}) {
  const valueClass =
    color === "destructive"
      ? "text-destructive/80"
      : color === "amber"
      ? "text-amber-600 dark:text-amber-400/80"
      : "text-foreground";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-display text-3xl font-light tabular-nums ${valueClass}`}>
        {value}
      </span>
      <span className="text-[10px] tracking-widest uppercase text-muted-foreground/50 font-light text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

function ClassCard({
  cls,
  subjects,
  topics,
  omitted,
  partial,
}: {
  cls: 9 | 10;
} & ClassStats) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/class/${cls}`}
        className="group block glass-card rounded-xl p-7 hover:border-primary/30 transition-all duration-500 edge-glow-top"
      >
        {/* Decorative oversized class number */}
        <div className="relative">
          <span
            className="absolute -top-2 -right-2 font-display text-8xl font-light text-foreground/[0.04] select-none leading-none"
            aria-hidden
          >
            {cls}
          </span>
          <div className="relative">
            <p className="text-[10px] font-light tracking-[0.3em] uppercase text-muted-foreground/50">
              ICSE
            </p>
            <h2 className="font-display text-4xl font-light mt-1 group-hover:text-primary transition-colors duration-300">
              Class {cls}
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-border/30 pt-4">
          <div className="flex justify-between text-sm font-light">
            <span className="text-muted-foreground/60 tracking-wide">Subjects</span>
            <span className="tabular-nums">{subjects}</span>
          </div>
          <div className="flex justify-between text-sm font-light">
            <span className="text-muted-foreground/60 tracking-wide">Total topics</span>
            <span className="tabular-nums">{topics}</span>
          </div>
          {omitted > 0 && (
            <div className="flex justify-between text-sm font-light">
              <span className="text-destructive/70 tracking-wide">Omitted</span>
              <span className="tabular-nums text-destructive/70">{omitted}</span>
            </div>
          )}
          {partial > 0 && (
            <div className="flex justify-between text-sm font-light">
              <span className="text-amber-600/70 dark:text-amber-400/70 tracking-wide">Partial</span>
              <span className="tabular-nums text-amber-600/70 dark:text-amber-400/70">{partial}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase text-primary/60 font-light group-hover:text-primary transition-colors duration-300">
            Browse syllabus
          </span>
          <span
            className="text-primary/40 group-hover:text-primary/70 group-hover:translate-x-1 transition-all duration-300 text-sm"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeHero({ stats9, stats10 }: HomeHeroProps) {
  const totalOmitted = stats9.omitted + stats10.omitted;
  const totalPartial = stats9.partial + stats10.partial;

  return (
    <motion.div
      className="space-y-14 max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Editorial masthead — dominant, cinematic */}
      <motion.div variants={fadeIn} className="text-center space-y-6 pt-8">
        <motion.p
          variants={fadeUp}
          className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground/50 font-light"
        >
          CISCE Official Circular · Session 2027–28
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="font-display font-light leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
        >
          <span className="block">ICSE</span>
          <span className="block italic text-champagne">Syllabus</span>
          <span
            className="block text-muted-foreground/35 font-light not-italic tracking-[0.12em]"
            style={{ fontSize: "0.55em" }}
          >
            2027 – 28
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-muted-foreground font-light text-base leading-relaxed max-w-sm mx-auto"
        >
          Official CISCE omissions for Class 9 &amp; 10 — every topic cited to
          the source PDF, page by page.
        </motion.p>
      </motion.div>

      {/* Exam countdown */}
      <motion.div variants={fadeUp}>
        <ExamCountdown />
      </motion.div>

      {/* Editorial stats dateline — typographic, not boxed */}
      <motion.div
        variants={fadeIn}
        className="flex items-center justify-center gap-8 text-center border-y border-border/40 py-6"
      >
        <StatPill value={totalOmitted + totalPartial} label="Topics with omissions" />
        <div className="w-px h-8 bg-border/40" aria-hidden />
        <StatPill value={totalOmitted} label="Fully omitted" color="destructive" />
        <div className="w-px h-8 bg-border/40" aria-hidden />
        <StatPill value={totalPartial} label="Partially omitted" color="amber" />
      </motion.div>

      {/* Class entry cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        <motion.div variants={cardVariant}>
          <ClassCard cls={9} {...stats9} />
        </motion.div>
        <motion.div variants={cardVariant}>
          <ClassCard cls={10} {...stats10} />
        </motion.div>
      </motion.div>

      {/* Footer attribution */}
      <motion.p
        variants={fadeIn}
        className="text-center text-[11px] text-muted-foreground/35 tracking-wider uppercase font-light pb-4"
      >
        Data sourced from official CISCE circulars · All citations traceable to source PDF pages
      </motion.p>
    </motion.div>
  );
}
