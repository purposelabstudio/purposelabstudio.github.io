// AHA blood-pressure classification. Educational reference only, not a diagnosis.
export function bpCategory(systolic, diastolic) {
  const s = Number(systolic) || 0;
  const d = Number(diastolic) || 0;
  const CATS = {
    crisis:   { key: 'crisis',   label: 'Hypertensive Crisis',           note: 'Seek emergency care if this reading repeats, especially with symptoms.' },
    stage2:   { key: 'stage2',   label: 'High Blood Pressure (Stage 2)', note: 'Talk to your doctor about treatment and lifestyle changes.' },
    stage1:   { key: 'stage1',   label: 'High Blood Pressure (Stage 1)', note: 'Consider lifestyle changes and follow up with your doctor.' },
    elevated: { key: 'elevated', label: 'Elevated',                      note: 'A good time to build healthier habits before it rises further.' },
    normal:   { key: 'normal',   label: 'Normal',                        note: 'Keep up the healthy habits and re-check periodically.' },
  };
  if (s >= 180 || d >= 120) return CATS.crisis;
  if (s >= 140 || d >= 90)  return CATS.stage2;
  if (s >= 130 || d >= 80)  return CATS.stage1;
  if (s >= 120 && d < 80)   return CATS.elevated;
  return CATS.normal;
}
