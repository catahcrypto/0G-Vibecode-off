const { mockPosts, mockBattleMentions } = require("./mockSocialFetcher");
const {
  directSentiment,
  battleSupportScore,
  combinedSentiment,
} = require("./mockSentimentAnalyzer");

/**
 * For local: compute mock sentiment for an address and optional battle context.
 * Returns { directScore, battleScore, finalScore } in 0-100.
 */
function computeMockSentiment(address, twitterHandle, redditHandle, opponentAddress, opponentHandles) {
  const posts = mockPosts(twitterHandle, redditHandle, address);
  const directScore = directSentiment(address, posts);

  let battleScore = 50;
  if (opponentAddress && opponentHandles) {
    const mentions = mockBattleMentions(twitterHandle, opponentHandles.twitterHandle, 5);
    const supportForMe = battleSupportScore(address, mentions, true);
    battleScore = supportForMe;
  }

  const finalScore = combinedSentiment(directScore, battleScore);
  return { directScore, battleScore, finalScore: Math.min(100, Math.max(0, finalScore)) };
}

/**
 * Pick winner by weighted random: higher sentiment = higher chance.
 * Returns "challenger" | "opponent".
 */
function pickWinner(challengerFinalScore, opponentFinalScore) {
  const total = challengerFinalScore + opponentFinalScore;
  if (total === 0) return Math.random() < 0.5 ? "challenger" : "opponent";
  const challengerProb = challengerFinalScore / total;
  return Math.random() < challengerProb ? "challenger" : "opponent";
}

module.exports = {
  computeMockSentiment,
  pickWinner,
};
