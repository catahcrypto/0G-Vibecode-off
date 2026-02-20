/**
 * Mock social fetcher for local testing - no API keys required.
 * Returns deterministic fake posts based on handle/address.
 */

function mockPosts(twitterHandle, redditHandle, address, count = 15) {
  const posts = [];
  const now = Date.now();
  const seed = address ? parseInt(address.slice(2, 10), 16) : 0;

  for (let i = 0; i < count; i++) {
    const daysOld = i % 7;
    const platform = i % 3 === 0 ? "reddit" : "twitter";
    const baseEngagement = 10 + ((seed + i) % 500);
    posts.push({
      id: `mock-${address}-${i}`,
      platform,
      content: `Mock post from ${platform === "twitter" ? twitterHandle : redditHandle} - building clout! #cloutbattle`,
      author: platform === "twitter" ? twitterHandle : redditHandle,
      timestamp: now - daysOld * 24 * 60 * 60 * 1000,
      engagement: {
        likes: platform === "twitter" ? baseEngagement : 0,
        retweets: platform === "twitter" ? Math.floor(baseEngagement / 5) : 0,
        replies: platform === "twitter" ? Math.floor(baseEngagement / 10) : 0,
        upvotes: platform === "reddit" ? baseEngagement : 0,
        comments: platform === "reddit" ? Math.floor(baseEngagement / 5) : 0,
      },
    });
  }
  return posts;
}

function mockBattleMentions(handleA, handleB, count = 5) {
  const mentions = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    mentions.push({
      postId: `mention-${i}`,
      content: `Who wins? ${handleA} vs ${handleB} - I'm team ${i % 2 === 0 ? handleA : handleB}!`,
      author: `user${i}`,
      timestamp: now - i * 3600000,
      supportScore: i % 2 === 0 ? 25 : 75,
      weight: 0.5,
    });
  }
  return mentions;
}

module.exports = {
  mockPosts,
  mockBattleMentions,
};
