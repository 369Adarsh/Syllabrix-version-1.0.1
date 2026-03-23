const queries = require('./search.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const search = async (userId, q, type, query) => {
  const { page, limit, offset } = getPagination(query);
  let results = {};

  if (!type || type === 'user') {
    const { users, total } = await queries.searchUsers(q, query.user_type, limit, offset);
    results.users = users;
    results.users_pagination = getPaginationMeta(total, page, limit);
  }
  if (!type || type === 'post') {
    const { posts, total } = await queries.searchPosts(q, limit, offset);
    results.posts = posts;
    results.posts_pagination = getPaginationMeta(total, page, limit);
  }
  if (!type || type === 'hashtag') {
    results.hashtags = await queries.searchHashtags(q, 20);
  }

  // Save search history
  if (q && q.length > 1) {
    await queries.saveSearchHistory(userId, q, type || null);
  }

  return results;
};

const getTrending = async () => queries.getTrendingHashtags(20);
const getHistory = async (userId) => queries.getSearchHistory(userId, 20);
const clearHistory = async (userId) => queries.clearSearchHistory(userId);

module.exports = { search, getTrending, getHistory, clearHistory };
