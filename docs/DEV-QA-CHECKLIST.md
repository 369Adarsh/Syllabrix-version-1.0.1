# Syllabrix Phase 1 — DEV to QA Checklist

## Pre-QA Verification (all must pass)

### Core Infrastructure
- [ ] Server starts without errors (`node src/server.js`)
- [ ] Database connected (27 tables verified)
- [ ] Health check returns 200 (`GET /api/health`)
- [ ] All 17 feature routes registered in routes/index.js
- [ ] Environment variables loaded correctly

### Auth System
- [ ] Register creates user with correct age_group
- [ ] Login returns JWT token
- [ ] Logout invalidates session
- [ ] Get Me returns user + type-specific profile
- [ ] Complete Profile works for all 4 types (student, teacher, institute, parent)
- [ ] Password reset flow works
- [ ] Invalid credentials return 401

### Social Features
- [ ] Create post (text only)
- [ ] Create post with media URL
- [ ] Feed returns posts (visibility logic works)
- [ ] Like/unlike toggle works (all 9 reaction types)
- [ ] Comment on post works
- [ ] Nested replies work
- [ ] Share/repost creates new post entry
- [ ] Save/unsave toggle works
- [ ] Saved posts list works

### Profiles & Follow
- [ ] View profile by ID
- [ ] View profile by username
- [ ] Update own profile (all 4 types)
- [ ] Follow/unfollow toggle
- [ ] Followers list (paginated)
- [ ] Following list (paginated)
- [ ] Follow suggestions work
- [ ] Cannot follow yourself (returns 400)
- [ ] Age-gated: 5-7 cannot follow

### Messaging & Groups
- [ ] Send DM
- [ ] Get conversations list
- [ ] Get conversation messages
- [ ] Mark message as read
- [ ] Delete message (own side)
- [ ] Unread count works
- [ ] Age-gated: under 14 cannot DM
- [ ] Create group
- [ ] Add/remove members
- [ ] Send group message
- [ ] Leave group
- [ ] Only admin can update group

### Jobs & Tuition
- [ ] Post job (teacher/institute only)
- [ ] List jobs with filters
- [ ] Apply to job
- [ ] View applications (job poster only)
- [ ] Update application status
- [ ] My posted jobs / My applications
- [ ] Post tuition ad
- [ ] Browse ads with filters
- [ ] My ads

### Search & Notifications
- [ ] Search users by name
- [ ] Search posts by content
- [ ] Search with type filter
- [ ] Trending hashtags
- [ ] Search history saved/cleared
- [ ] Get notifications (paginated)
- [ ] Unread count
- [ ] Mark all read
- [ ] Mark single read
- [ ] Dismiss notification

### Parent & Safety
- [ ] Parent can link child
- [ ] Parent can view children
- [ ] Parent can view child activity
- [ ] Block user (unfollows both ways)
- [ ] Unblock user
- [ ] Blocked list
- [ ] Report user/post/comment
- [ ] Blocked users cannot interact

### Upload
- [ ] Upload profile photo (Cloudinary)
- [ ] Upload cover photo
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] File type validation works
- [ ] File size limit enforced

### Security
- [ ] Protected routes reject without token
- [ ] Expired token returns 401
- [ ] Rate limiting works (auth endpoints)
- [ ] Input sanitization strips HTML
- [ ] SQL injection prevented (parameterized queries)
- [ ] CORS configured correctly

### QA Accounts
- [ ] 20 QA accounts seeded
- [ ] All 5 user types present
- [ ] Profiles completed for all accounts
- [ ] Parent-child links created
- [ ] Follow relationships created

---
**When ALL boxes are checked → merge develop to qa branch**
