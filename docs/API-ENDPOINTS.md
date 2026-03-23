# Syllabrix Phase 1 — Complete API Reference
## 92 Endpoints | 17 Features | All Tested

**Base URL:** `http://localhost:5000/api`
**Auth:** All protected routes require `Authorization: Bearer <token>` header
**Password for QA accounts:** `Test@1234`

---

## AUTH (10 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Login, get JWT token |
| POST | /auth/logout | Yes | Invalidate session |
| GET | /auth/me | Yes | Get current user + profile |
| POST | /auth/complete-profile/student | Yes | Complete student profile |
| POST | /auth/complete-profile/teacher | Yes | Complete teacher profile |
| POST | /auth/complete-profile/institute | Yes | Complete institute profile |
| POST | /auth/complete-profile/parent | Yes | Complete parent profile |
| POST | /auth/forgot-password | No | Request password reset |
| POST | /auth/reset-password | No | Reset with token |

## POSTS (6 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /posts | Yes | Create post (age-gated) |
| GET | /posts/feed | Yes | Home feed (paginated) |
| GET | /posts/:postId | Yes | Single post |
| GET | /posts/user/:userId | Yes | User's posts |
| PUT | /posts/:postId | Yes | Edit own post |
| DELETE | /posts/:postId | Yes | Delete own post |

## LIKES (2 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /likes/:postId | Yes | Toggle like/reaction (9 types) |
| GET | /likes/:postId | Yes | Who liked a post |

## COMMENTS (4 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /comments/:postId | Yes | Add comment (age-gated) |
| GET | /comments/:postId | Yes | Post comments |
| GET | /comments/:commentId/replies | Yes | Nested replies |
| DELETE | /comments/:commentId | Yes | Delete own comment |

## SHARES (2 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /shares/:postId | Yes | Share/repost |
| GET | /shares/:postId | Yes | View who shared |

## SAVES (2 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /saves/:postId | Yes | Toggle save/unsave |
| GET | /saves | Yes | Get saved posts |

## UPLOAD (5 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /upload/single | Yes | Upload 1 file |
| POST | /upload/multiple | Yes | Upload up to 5 files |
| POST | /upload/profile-photo | Yes | Upload/change avatar |
| POST | /upload/cover-photo | Yes | Upload/change cover |
| DELETE | /upload/:publicId | Yes | Delete from Cloudinary |

## PROFILE (4 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /profile/:userId | Yes | View profile by ID |
| GET | /profile/username/:username | Yes | View profile by username |
| PUT | /profile | Yes | Update own profile |
| GET | /profile/suggestions | Yes | Follow suggestions |

## FOLLOW (5 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /follow/:userId | Yes | Toggle follow (age-gated) |
| GET | /follow/:userId/followers | Yes | Followers list |
| GET | /follow/:userId/following | Yes | Following list |
| GET | /follow/:userId/status | Yes | Check follow status |
| GET | /follow/:userId/mutual | Yes | Mutual follows |

## MESSAGES (6 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /messages/conversations | Yes | All conversations |
| GET | /messages/unread-count | Yes | Unread badge count |
| GET | /messages/:userId | Yes | Chat with user |
| POST | /messages/:userId | Yes | Send DM (age-gated) |
| PUT | /messages/:messageId/read | Yes | Mark read |
| DELETE | /messages/:messageId | Yes | Delete own side |

## GROUPS (12 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /groups | Yes | Create group (age-gated) |
| GET | /groups | Yes | My groups |
| GET | /groups/:groupId | Yes | Group details |
| PUT | /groups/:groupId | Yes | Update (admin) |
| DELETE | /groups/:groupId | Yes | Delete (creator) |
| GET | /groups/:groupId/members | Yes | List members |
| POST | /groups/:groupId/members | Yes | Add member |
| DELETE | /groups/:groupId/members/:userId | Yes | Remove member |
| PUT | /groups/:groupId/members/:userId | Yes | Change role |
| POST | /groups/:groupId/leave | Yes | Leave group |
| GET | /groups/:groupId/messages | Yes | Group messages |
| POST | /groups/:groupId/messages | Yes | Send group message |

## JOBS (10 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /jobs | Yes | Post job (teacher/institute only) |
| GET | /jobs | Yes | List jobs (filterable) |
| GET | /jobs/:jobId | Yes | Job details |
| PUT | /jobs/:jobId | Yes | Update own job |
| DELETE | /jobs/:jobId | Yes | Delete own job |
| POST | /jobs/:jobId/apply | Yes | Apply to job |
| GET | /jobs/:jobId/applications | Yes | View applications (poster) |
| PUT | /jobs/:jobId/applications/:aid | Yes | Update app status |
| GET | /jobs/my-posts | Yes | My posted jobs |
| GET | /jobs/my-applications | Yes | My applications |

## TUITION (6 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /tuition | Yes | Post tuition ad |
| GET | /tuition | Yes | Browse ads (filterable) |
| GET | /tuition/:adId | Yes | Ad details |
| PUT | /tuition/:adId | Yes | Update own ad |
| DELETE | /tuition/:adId | Yes | Delete own ad |
| GET | /tuition/my-ads | Yes | My ads |

## SEARCH (4 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /search?q=&type= | Yes | Search users/posts/hashtags |
| GET | /search/trending | Yes | Trending hashtags |
| GET | /search/history | Yes | My search history |
| DELETE | /search/history | Yes | Clear search history |

## NOTIFICATIONS (5 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /notifications | Yes | Get notifications |
| GET | /notifications/unread-count | Yes | Unread count |
| PUT | /notifications/read-all | Yes | Mark all read |
| PUT | /notifications/:notifId/read | Yes | Mark one read |
| DELETE | /notifications/:notifId | Yes | Dismiss |

## PARENT (4 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /parent/link-child | Yes | Link to child (parent only) |
| GET | /parent/children | Yes | Get linked children |
| GET | /parent/child/:childId/activity | Yes | Child activity report |
| DELETE | /parent/child/:childId/link | Yes | Remove link |

## SAFETY (5 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /safety/block/:userId | Yes | Block user |
| DELETE | /safety/block/:userId | Yes | Unblock user |
| GET | /safety/blocked | Yes | Blocked list |
| POST | /safety/report | Yes | Report user/post/comment |
| GET | /safety/my-reports | Yes | My reports |

## HEALTH (1 endpoint)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Server status |

---
**Total: 92 endpoints + 1 health check = 93 API routes**
