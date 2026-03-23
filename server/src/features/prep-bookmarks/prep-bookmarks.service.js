const q = require('./prep-bookmarks.queries');
const add = async (userId, data) => { await q.add(userId, data.content_type, data.content_id, data.folder_name, data.notes); return { message: 'Bookmarked.' }; };
const remove = async (id, userId) => { await q.remove(id, userId); return { message: 'Removed.' }; };
const getAll = async (userId, folder) => q.getAll(userId, folder);
const getFolders = async (userId) => q.getFolders(userId);
module.exports = { add, remove, getAll, getFolders };
