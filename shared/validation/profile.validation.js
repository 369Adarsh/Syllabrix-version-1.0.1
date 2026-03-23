const studentProfileRules = {
  full_name:{required:true,minLength:2,maxLength:100},
  school_name:{required:true,maxLength:200}, class_name:{required:true,maxLength:50},
  board:{required:true,oneOf:['CBSE','ICSE','state_board','IB','Cambridge','NIOS','other']},
  medium:{required:true,oneOf:['english','hindi','regional','bilingual']},
};
const teacherProfileRules = {
  full_name:{required:true}, subject_primary:{required:true},
  teacher_type:{required:true,oneOf:['school','college','freelance','coaching','online']},
};
const instituteProfileRules = { name:{required:true}, institute_type:{required:true}, city:{required:true}, state:{required:true} };
const parentProfileRules = { full_name:{required:true}, relationship:{required:true,oneOf:['father','mother','guardian','other']} };
module.exports = { studentProfileRules, teacherProfileRules, instituteProfileRules, parentProfileRules };
