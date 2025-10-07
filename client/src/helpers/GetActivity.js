export function getAuraLabel(aura) {
  const score = parseInt(aura);
  if (score > 10) return "Positive";
  if (score > 0) return "Mostly Positive";
  if (score === 0) return "Neutral";
  if (score < 0 && score > -10) return "Mixed";
  return "Controversial";
}
