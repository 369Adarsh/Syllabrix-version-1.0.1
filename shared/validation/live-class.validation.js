module.exports = { scheduleClassRules: { title:{required:true}, subject:{required:true}, class_type:{required:true,oneOf:['free','paid','demo']}, duration_minutes:{required:true,min:15,max:180} } };
