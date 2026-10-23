// Automatic marking for complementary course lessons.
// Multiple-choice reading questions are marked against the key. Written responses are always "open":
// students see the model answer, and the teacher reads them in each lesson's results.
function markItem(item, answer) {
  if (item.type === "mc") return answer != null && String(answer) === String(item.answer);
  return null;
}
function rule() { return { t: "open" }; }
function levelFor(pct) { return pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 50 ? 2 : 1; }
module.exports = { rule, markItem, levelFor };
