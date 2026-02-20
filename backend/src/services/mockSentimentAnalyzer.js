/**
 * Mock sentiment analyzer for local testing.
 * Returns deterministic scores 0-100 based on address + optional bias.
 */

function hashAddress(address) {
  let h = 0;
  const s = (address || "").toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function directSentiment(address, _posts) {
  const h = hashAddress(address);
  return 40 + (h % 55); // 40-95 range
}

function battleSupportScore(address, _mentions, isChallenger) {
  const h = hashAddress(address);
  const base = 30 + (h % 50);
  return isChallenger ? base : 100 - base;
}

function combinedSentiment(directScore, battleScore) {
  return Math.round(directScore * 0.7 + battleScore * 0.3);
}

module.exports = {
  directSentiment,
  battleSupportScore,
  combinedSentiment,
};
