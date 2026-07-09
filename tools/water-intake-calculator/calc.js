// Pure water-intake estimate in millilitres. Educational, not medical advice.
export function waterIntakeMl(weightKg, activity, climate) {
  const w = Math.min(200, Math.max(30, Number(weightKg) || 0));
  let ml = w * 33;
  if (activity === 'moderate') ml += 350;
  else if (activity === 'active') ml += 700;
  if (climate === 'hot') ml += 500;
  return Math.round(ml);
}
