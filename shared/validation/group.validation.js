module.exports = { createGroupRules: { name:{required:true,minLength:3,maxLength:100}, group_type:{oneOf:['public','private','class','study']} } };
