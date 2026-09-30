---
name: framer-motion
description: Framer Motion (motion) animation guidance: transitions, layout animations, gestures, scroll and stagger effects. Use when adding animation.
---

# Framer Motion

- Install: npm i motion (import from "motion/react") or framer-motion.
- Use motion.div with initial/animate/exit, AnimatePresence for mount/unmount, layout/layoutId for shared transitions.
- Prefer spring transitions; stagger children via variants; whileHover/whileTap for feedback; useScroll for scroll effects.
- Animate transform and opacity only; keep durations 150–400ms.
- Respect reduced motion (useReducedMotion / MotionConfig reducedMotion="user").
- In vanilla JS, use the Motion library's animate() or CSS transitions/Web Animations API.
