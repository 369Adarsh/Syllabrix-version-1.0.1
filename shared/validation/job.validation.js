module.exports = {
  createJobRules: { title:{required:true,maxLength:200}, description:{required:true,maxLength:5000}, job_type:{required:true} },
  applyJobRules: { cover_message:{maxLength:2000} },
};
