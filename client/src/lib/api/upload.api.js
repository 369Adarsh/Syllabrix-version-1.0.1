import api from '../api-client';

export const uploadAPI = {
  profilePhoto: (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return api.post('/upload/profile-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  coverPhoto: (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return api.post('/upload/cover-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  single: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  resume: (file) => {
    const fd = new FormData(); fd.append('resume', file);
    return api.post('/upload/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
