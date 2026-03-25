import { clsx } from "clsx";

export function cn(...classes) {
  return clsx(...classes);
}

export function formatCurrency(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getScoreColor(score) {
  if (score >= 35) return "border-gold text-gold";
  if (score >= 25) return "border-brand-400 text-brand-400";
  if (score >= 15) return "border-blue-400 text-blue-400";
  return "border-white/30 text-cream/60";
}

export function getScoreLabel(score) {
  if (score >= 35) return "Excellent";
  if (score >= 25) return "Good";
  if (score >= 15) return "Average";
  return "Below Par";
}

/** Calculate matching numbers between user scores and draw winning numbers */
export function calculateMatches(userScores, winningNumbers) {
  if (!userScores?.length || !winningNumbers?.length) return 0;
  const userSet = new Set(userScores);
  return winningNumbers.filter((n) => userSet.has(n)).length;
}

/** Determine prize tier from match count */
export function getPrizeTier(matchCount) {
  if (matchCount >= 5) return "jackpot";
  if (matchCount === 4) return "4match";
  if (matchCount === 3) return "3match";
  return null;
}

/** Monthly subscription amounts */
export const PLAN_PRICES = {
  monthly: 19.99,
  yearly: 199.99,
};

/** Pool split percentages */
export const PRIZE_SPLIT = {
  jackpot: 0.4,
  "4match": 0.35,
  "3match": 0.25,
};

export function calculatePools(totalPool) {
  return {
    jackpot: totalPool * PRIZE_SPLIT.jackpot,
    "4match": totalPool * PRIZE_SPLIT["4match"],
    "3match": totalPool * PRIZE_SPLIT["3match"],
  };
}

/** Generate random 5 winning numbers (1-45) */
export function generateRandomDraw() {
  const numbers = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
}

/** Generate algorithmic draw weighted by score frequency */
export function generateAlgorithmicDraw(allScores) {
  if (!allScores?.length) return generateRandomDraw();

  // Build frequency map
  const freq = {};
  allScores.forEach((s) => {
    freq[s] = (freq[s] || 0) + 1;
  });

  // Create weighted pool (higher freq = more likely)
  const pool = [];
  Object.entries(freq).forEach(([score, count]) => {
    for (let i = 0; i < count; i++) pool.push(Number(score));
  });

  // Pick 5 unique from weighted pool
  const picked = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const n of shuffled) {
    if (!picked.includes(n)) picked.push(n);
    if (picked.length === 5) break;
  }

  // Fill remainder with random if needed
  while (picked.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!picked.includes(n)) picked.push(n);
  }

  return picked.sort((a, b) => a - b);
}

export function truncate(str, len = 120) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
