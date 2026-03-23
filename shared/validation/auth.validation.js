const registerRules = {
  username:{minLength:3,maxLength:30,pattern:'^[a-zA-Z0-9_]+$'},
  email:{required:true,type:'email'}, password:{minLength:8,maxLength:128},
  user_type:{required:true,oneOf:['student','teacher','institute','parent','mentor']},
  date_of_birth:{required:true,type:'date'},
};
const loginRules = {email:{required:true,type:'email'},password:{required:true}};
module.exports = { registerRules, loginRules };
