const slugify = (t) => t ? t.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'') : '';
module.exports = { slugify };
