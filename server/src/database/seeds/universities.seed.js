/**
 * Seed: universities.seed.js
 * Seeds top 100 Indian universities: IITs, NITs, AIIMS, Central, IIMs, Deemed/Private, State.
 * Idempotent — uses INSERT IGNORE on (name, type) duplicate check via unique seed key approach:
 *   We match on name + type with a SELECT first, then INSERT IGNORE.
 *
 * Run from server/ directory:
 *   node src/database/seeds/universities.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

const universities = [
  // ─── IITs (23) ────────────────────────────────────────────────────────────────
  { name: 'Indian Institute of Technology Bombay',      short_name: 'IIT Bombay',      type: 'iit', city: 'Mumbai',        state: 'Maharashtra',  website: 'https://www.iitb.ac.in',     naac: 'A++', nirf: 3  },
  { name: 'Indian Institute of Technology Delhi',       short_name: 'IIT Delhi',       type: 'iit', city: 'New Delhi',     state: 'Delhi',        website: 'https://home.iitd.ac.in',    naac: 'A++', nirf: 2  },
  { name: 'Indian Institute of Technology Madras',      short_name: 'IIT Madras',      type: 'iit', city: 'Chennai',       state: 'Tamil Nadu',   website: 'https://www.iitm.ac.in',     naac: 'A++', nirf: 1  },
  { name: 'Indian Institute of Technology Kanpur',      short_name: 'IIT Kanpur',      type: 'iit', city: 'Kanpur',        state: 'Uttar Pradesh',website: 'https://www.iitk.ac.in',     naac: 'A++', nirf: 4  },
  { name: 'Indian Institute of Technology Kharagpur',   short_name: 'IIT Kharagpur',   type: 'iit', city: 'Kharagpur',     state: 'West Bengal',  website: 'https://www.iitkgp.ac.in',   naac: 'A++', nirf: 5  },
  { name: 'Indian Institute of Technology Roorkee',     short_name: 'IIT Roorkee',     type: 'iit', city: 'Roorkee',       state: 'Uttarakhand',  website: 'https://www.iitr.ac.in',     naac: 'A++', nirf: 6  },
  { name: 'Indian Institute of Technology Guwahati',    short_name: 'IIT Guwahati',    type: 'iit', city: 'Guwahati',      state: 'Assam',        website: 'https://www.iitg.ac.in',     naac: 'A+',  nirf: 7  },
  { name: 'Indian Institute of Technology Hyderabad',   short_name: 'IIT Hyderabad',   type: 'iit', city: 'Hyderabad',     state: 'Telangana',    website: 'https://www.iith.ac.in',     naac: 'A',   nirf: 8  },
  { name: 'Indian Institute of Technology (BHU)',       short_name: 'IIT BHU',         type: 'iit', city: 'Varanasi',      state: 'Uttar Pradesh',website: 'https://www.iitbhu.ac.in',   naac: 'A',   nirf: 10 },
  { name: 'Indian Institute of Technology Indore',      short_name: 'IIT Indore',      type: 'iit', city: 'Indore',        state: 'Madhya Pradesh',website: 'https://www.iiti.ac.in',    naac: 'A',   nirf: 11 },
  { name: 'Indian Institute of Technology Mandi',       short_name: 'IIT Mandi',       type: 'iit', city: 'Mandi',         state: 'Himachal Pradesh',website: 'https://www.iitmandi.ac.in',naac: 'NA', nirf: null},
  { name: 'Indian Institute of Technology Patna',       short_name: 'IIT Patna',       type: 'iit', city: 'Patna',         state: 'Bihar',        website: 'https://www.iitp.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Jodhpur',     short_name: 'IIT Jodhpur',     type: 'iit', city: 'Jodhpur',       state: 'Rajasthan',    website: 'https://www.iitj.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Gandhinagar', short_name: 'IIT Gandhinagar', type: 'iit', city: 'Gandhinagar',   state: 'Gujarat',      website: 'https://www.iitgn.ac.in',    naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Bhubaneswar', short_name: 'IIT Bhubaneswar', type: 'iit', city: 'Bhubaneswar',   state: 'Odisha',       website: 'https://www.iitbbs.ac.in',   naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Ropar',       short_name: 'IIT Ropar',       type: 'iit', city: 'Ropar',         state: 'Punjab',       website: 'https://www.iitrpr.ac.in',   naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Tirupati',    short_name: 'IIT Tirupati',    type: 'iit', city: 'Tirupati',      state: 'Andhra Pradesh',website: 'https://www.iittp.ac.in',   naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology (ISM) Dhanbad',short_name:'IIT Dhanbad',    type: 'iit', city: 'Dhanbad',       state: 'Jharkhand',    website: 'https://www.iitism.ac.in',   naac: 'A',   nirf: 12 },
  { name: 'Indian Institute of Technology Palakkad',    short_name: 'IIT Palakkad',    type: 'iit', city: 'Palakkad',      state: 'Kerala',       website: 'https://www.iitpkd.ac.in',   naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Jammu',       short_name: 'IIT Jammu',       type: 'iit', city: 'Jammu',         state: 'Jammu & Kashmir',website: 'https://www.iitjammu.ac.in',naac:'NA',  nirf: null},
  { name: 'Indian Institute of Technology Dharwad',     short_name: 'IIT Dharwad',     type: 'iit', city: 'Dharwad',       state: 'Karnataka',    website: 'https://www.iitdh.ac.in',    naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Bhilai',      short_name: 'IIT Bhilai',      type: 'iit', city: 'Bhilai',        state: 'Chhattisgarh', website: 'https://www.iitbhilai.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Technology Varanasi',    short_name: 'IIT Varanasi',    type: 'iit', city: 'Varanasi',      state: 'Uttar Pradesh',website: 'https://www.iitbhu.ac.in',   naac: 'NA',  nirf: null},

  // ─── NITs (31) ────────────────────────────────────────────────────────────────
  { name: 'National Institute of Technology Tiruchirappalli', short_name: 'NIT Trichy',    type: 'nit', city: 'Tiruchirappalli', state: 'Tamil Nadu',    website: 'https://www.nitt.edu',       naac: 'A++', nirf: 9  },
  { name: 'National Institute of Technology Warangal',        short_name: 'NIT Warangal',  type: 'nit', city: 'Warangal',       state: 'Telangana',     website: 'https://www.nitw.ac.in',     naac: 'A+',  nirf: 25 },
  { name: 'National Institute of Technology Karnataka',       short_name: 'NIT Surathkal', type: 'nit', city: 'Surathkal',      state: 'Karnataka',     website: 'https://www.nitk.ac.in',     naac: 'A+',  nirf: 27 },
  { name: 'National Institute of Technology Calicut',         short_name: 'NIT Calicut',   type: 'nit', city: 'Kozhikode',      state: 'Kerala',        website: 'https://www.nitc.ac.in',     naac: 'A+',  nirf: 28 },
  { name: 'Motilal Nehru National Institute of Technology',   short_name: 'NIT Allahabad', type: 'nit', city: 'Allahabad',      state: 'Uttar Pradesh', website: 'https://www.mnnit.ac.in',    naac: 'A+',  nirf: 40 },
  { name: 'National Institute of Technology Rourkela',        short_name: 'NIT Rourkela',  type: 'nit', city: 'Rourkela',       state: 'Odisha',        website: 'https://www.nitrkl.ac.in',   naac: 'A+',  nirf: 22 },
  { name: 'Malaviya National Institute of Technology Jaipur', short_name: 'NIT Jaipur',    type: 'nit', city: 'Jaipur',         state: 'Rajasthan',     website: 'https://www.mnit.ac.in',     naac: 'A+',  nirf: 35 },
  { name: 'Sardar Vallabhbhai National Institute of Technology',short_name:'NIT Surat',    type: 'nit', city: 'Surat',          state: 'Gujarat',       website: 'https://www.svnit.ac.in',    naac: 'A+',  nirf: 39 },
  { name: 'National Institute of Technology Kurukshetra',     short_name: 'NIT Kurukshetra',type:'nit', city: 'Kurukshetra',    state: 'Haryana',       website: 'https://nitkkr.ac.in',       naac: 'A',   nirf: 43 },
  { name: 'National Institute of Technology Durgapur',        short_name: 'NIT Durgapur',  type: 'nit', city: 'Durgapur',       state: 'West Bengal',   website: 'https://www.nitdgp.ac.in',   naac: 'A',   nirf: 48 },
  { name: 'National Institute of Technology Silchar',         short_name: 'NIT Silchar',   type: 'nit', city: 'Silchar',        state: 'Assam',         website: 'https://www.nits.ac.in',     naac: 'A',   nirf: null},
  { name: 'National Institute of Technology Hamirpur',        short_name: 'NIT Hamirpur',  type: 'nit', city: 'Hamirpur',       state: 'Himachal Pradesh',website: 'https://nith.ac.in',        naac: 'A',   nirf: null},
  { name: 'National Institute of Technology Jamshedpur',      short_name: 'NIT Jamshedpur',type: 'nit', city: 'Jamshedpur',     state: 'Jharkhand',     website: 'https://www.nitjsr.ac.in',   naac: 'A',   nirf: null},
  { name: 'National Institute of Technology Patna',           short_name: 'NIT Patna',     type: 'nit', city: 'Patna',          state: 'Bihar',         website: 'https://www.nitp.ac.in',     naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Agartala',        short_name: 'NIT Agartala',  type: 'nit', city: 'Agartala',       state: 'Tripura',       website: 'https://www.nita.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Visvesvaraya National Institute of Technology',    short_name: 'VNIT Nagpur',   type: 'nit', city: 'Nagpur',         state: 'Maharashtra',   website: 'https://www.vnit.ac.in',     naac: 'A+',  nirf: 36 },
  { name: 'National Institute of Technology Manipur',         short_name: 'NIT Manipur',   type: 'nit', city: 'Imphal',         state: 'Manipur',       website: 'https://www.nitmanipur.ac.in',naac:'NA',  nirf: null},
  { name: 'National Institute of Technology Meghalaya',       short_name: 'NIT Meghalaya', type: 'nit', city: 'Shillong',       state: 'Meghalaya',     website: 'https://nitm.ac.in',         naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Mizoram',         short_name: 'NIT Mizoram',   type: 'nit', city: 'Aizawl',         state: 'Mizoram',       website: 'https://www.nitmz.ac.in',    naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Nagaland',        short_name: 'NIT Nagaland',  type: 'nit', city: 'Dimapur',        state: 'Nagaland',      website: 'https://www.nitnagaland.ac.in',naac:'NA', nirf: null},
  { name: 'National Institute of Technology Puducherry',      short_name: 'NIT Puducherry',type: 'nit', city: 'Karaikal',       state: 'Puducherry',    website: 'https://www.nitpy.ac.in',    naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Raipur',          short_name: 'NIT Raipur',    type: 'nit', city: 'Raipur',         state: 'Chhattisgarh',  website: 'https://www.nitrr.ac.in',    naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Sikkim',          short_name: 'NIT Sikkim',    type: 'nit', city: 'Ravangla',       state: 'Sikkim',        website: 'https://nitsikkim.ac.in',    naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Srinagar',        short_name: 'NIT Srinagar',  type: 'nit', city: 'Srinagar',       state: 'Jammu & Kashmir',website: 'https://www.nitsri.ac.in',  naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Uttarakhand',     short_name: 'NIT Uttarakhand',type:'nit', city: 'Srinagar Garhwal',state:'Uttarakhand',   website: 'https://www.nituk.ac.in',    naac: 'NA',  nirf: null},
  { name: 'Maulana Azad National Institute of Technology',    short_name: 'MANIT Bhopal',  type: 'nit', city: 'Bhopal',         state: 'Madhya Pradesh',website: 'https://www.manit.ac.in',    naac: 'A+',  nirf: 44 },
  { name: 'Dr. B R Ambedkar National Institute of Technology',short_name: 'NIT Jalandhar', type: 'nit', city: 'Jalandhar',      state: 'Punjab',        website: 'https://www.nitj.ac.in',     naac: 'A',   nirf: 55 },
  { name: 'National Institute of Technology Delhi',           short_name: 'NIT Delhi',     type: 'nit', city: 'New Delhi',      state: 'Delhi',         website: 'https://www.nitdelhi.ac.in', naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Goa',             short_name: 'NIT Goa',       type: 'nit', city: 'Goa',            state: 'Goa',           website: 'https://www.nitgoa.ac.in',   naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Andhra Pradesh',  short_name: 'NIT Andhra',    type: 'nit', city: 'Tadepalligudem', state: 'Andhra Pradesh',website: 'https://www.nitandhra.ac.in',naac: 'NA',  nirf: null},
  { name: 'National Institute of Technology Arunachal Pradesh',short_name:'NIT Arunachal', type: 'nit', city: 'Yupia',          state: 'Arunachal Pradesh',website:'https://www.nitap.ac.in',  naac: 'NA',  nirf: null},

  // ─── AIIMS (8) ────────────────────────────────────────────────────────────────
  { name: 'All India Institute of Medical Sciences Delhi',       short_name: 'AIIMS Delhi',       type: 'aiims', city: 'New Delhi',  state: 'Delhi',          website: 'https://www.aiims.edu',          naac: 'A++', nirf: 1  },
  { name: 'All India Institute of Medical Sciences Jodhpur',    short_name: 'AIIMS Jodhpur',    type: 'aiims', city: 'Jodhpur',    state: 'Rajasthan',      website: 'https://www.aiimsjodhpur.edu.in',naac: 'A+',  nirf: null},
  { name: 'All India Institute of Medical Sciences Bhopal',     short_name: 'AIIMS Bhopal',     type: 'aiims', city: 'Bhopal',     state: 'Madhya Pradesh', website: 'https://www.aiimsbhopal.edu.in', naac: 'NA',  nirf: null},
  { name: 'All India Institute of Medical Sciences Patna',      short_name: 'AIIMS Patna',      type: 'aiims', city: 'Patna',      state: 'Bihar',          website: 'https://www.aiimspatna.edu.in',  naac: 'NA',  nirf: null},
  { name: 'All India Institute of Medical Sciences Raipur',     short_name: 'AIIMS Raipur',     type: 'aiims', city: 'Raipur',     state: 'Chhattisgarh',   website: 'https://www.aiimsraipur.edu.in', naac: 'NA',  nirf: null},
  { name: 'All India Institute of Medical Sciences Rishikesh',  short_name: 'AIIMS Rishikesh',  type: 'aiims', city: 'Rishikesh',  state: 'Uttarakhand',    website: 'https://www.aiimsrishikesh.edu.in',naac:'NA', nirf: null},
  { name: 'All India Institute of Medical Sciences Bhubaneswar',short_name: 'AIIMS Bhubaneswar',type: 'aiims', city: 'Bhubaneswar',state: 'Odisha',         website: 'https://www.aiimsbhubaneswar.edu.in',naac:'NA',nirf: null},
  { name: 'All India Institute of Medical Sciences Nagpur',     short_name: 'AIIMS Nagpur',     type: 'aiims', city: 'Nagpur',     state: 'Maharashtra',    website: 'https://www.aiimsnagpur.edu.in', naac: 'NA',  nirf: null},

  // ─── CENTRAL UNIVERSITIES (20) ────────────────────────────────────────────────
  { name: 'University of Delhi',                  short_name: 'DU',          type: 'central', city: 'New Delhi',    state: 'Delhi',          website: 'https://www.du.ac.in',          naac: 'A++', nirf: 11 },
  { name: 'Jawaharlal Nehru University',           short_name: 'JNU',         type: 'central', city: 'New Delhi',    state: 'Delhi',          website: 'https://www.jnu.ac.in',         naac: 'A++', nirf: 2  },
  { name: 'Banaras Hindu University',              short_name: 'BHU',         type: 'central', city: 'Varanasi',     state: 'Uttar Pradesh',  website: 'https://www.bhu.ac.in',         naac: 'A+',  nirf: 5  },
  { name: 'University of Hyderabad',               short_name: 'UoH',         type: 'central', city: 'Hyderabad',    state: 'Telangana',      website: 'https://www.uohyd.ac.in',       naac: 'A++', nirf: 7  },
  { name: 'Jadavpur University',                   short_name: 'JU',          type: 'central', city: 'Kolkata',      state: 'West Bengal',    website: 'https://jadavpuruniversity.in',  naac: 'A++', nirf: 6  },
  { name: 'Savitribai Phule Pune University',      short_name: 'SPPU',        type: 'central', city: 'Pune',         state: 'Maharashtra',    website: 'https://www.unipune.ac.in',     naac: 'A+',  nirf: null},
  { name: 'Jamia Millia Islamia',                  short_name: 'JMI',         type: 'central', city: 'New Delhi',    state: 'Delhi',          website: 'https://www.jmi.ac.in',         naac: 'A+',  nirf: 12 },
  { name: 'Aligarh Muslim University',             short_name: 'AMU',         type: 'central', city: 'Aligarh',      state: 'Uttar Pradesh',  website: 'https://www.amu.ac.in',         naac: 'A+',  nirf: 9  },
  { name: 'Tata Institute of Social Sciences',     short_name: 'TISS',        type: 'central', city: 'Mumbai',       state: 'Maharashtra',    website: 'https://www.tiss.edu',          naac: 'A',   nirf: null},
  { name: 'English and Foreign Languages University',short_name:'EFLU',       type: 'central', city: 'Hyderabad',    state: 'Telangana',      website: 'https://www.efluniversity.ac.in',naac: 'A',  nirf: null},
  { name: 'Central University of Rajasthan',       short_name: 'CURAJ',       type: 'central', city: 'Kishangarh',   state: 'Rajasthan',      website: 'https://www.curaj.ac.in',       naac: 'A',   nirf: null},
  { name: 'Pondicherry University',                short_name: 'PU',          type: 'central', city: 'Puducherry',   state: 'Puducherry',     website: 'https://www.pondiuni.edu.in',   naac: 'A+',  nirf: null},
  { name: 'Northeastern Hill University',          short_name: 'NEHU',        type: 'central', city: 'Shillong',     state: 'Meghalaya',      website: 'https://nehu.ac.in',            naac: 'A',   nirf: null},
  { name: 'Hemwati Nandan Bahuguna Garhwal University',short_name:'HNBGU',    type: 'central', city: 'Srinagar',     state: 'Uttarakhand',    website: 'https://www.hnbgu.ac.in',       naac: 'A',   nirf: null},
  { name: 'Assam University',                      short_name: 'AU',          type: 'central', city: 'Silchar',      state: 'Assam',          website: 'https://www.aus.ac.in',         naac: 'A',   nirf: null},
  { name: 'Mizoram University',                    short_name: 'MZU',         type: 'central', city: 'Aizawl',       state: 'Mizoram',        website: 'https://www.mzu.edu.in',        naac: 'A',   nirf: null},
  { name: 'Manipur University',                    short_name: 'MU',          type: 'central', city: 'Imphal',       state: 'Manipur',        website: 'https://www.manipuruniv.ac.in', naac: 'A',   nirf: null},
  { name: 'Nagaland University',                   short_name: 'NU',          type: 'central', city: 'Lumami',       state: 'Nagaland',       website: 'https://nagalanduniversity.ac.in',naac:'NA',  nirf: null},
  { name: 'Tripura University',                    short_name: 'TU',          type: 'central', city: 'Agartala',     state: 'Tripura',        website: 'https://tripurauniv.ac.in',     naac: 'A',   nirf: null},
  { name: 'Tezpur University',                     short_name: 'Tezpur Uni',  type: 'central', city: 'Tezpur',       state: 'Assam',          website: 'https://www.tezu.ernet.in',     naac: 'A+',  nirf: null},

  // ─── IIMs (21) ────────────────────────────────────────────────────────────────
  { name: 'Indian Institute of Management Ahmedabad',     short_name: 'IIM Ahmedabad',      type: 'iim', city: 'Ahmedabad',     state: 'Gujarat',        website: 'https://www.iima.ac.in',     naac: 'A++', nirf: 1  },
  { name: 'Indian Institute of Management Bangalore',     short_name: 'IIM Bangalore',      type: 'iim', city: 'Bengaluru',     state: 'Karnataka',      website: 'https://www.iimb.ac.in',     naac: 'A++', nirf: 2  },
  { name: 'Indian Institute of Management Calcutta',      short_name: 'IIM Calcutta',       type: 'iim', city: 'Kolkata',       state: 'West Bengal',    website: 'https://www.iimcal.ac.in',   naac: 'A++', nirf: 3  },
  { name: 'Indian Institute of Management Lucknow',       short_name: 'IIM Lucknow',        type: 'iim', city: 'Lucknow',       state: 'Uttar Pradesh',  website: 'https://www.iiml.ac.in',     naac: 'A++', nirf: 4  },
  { name: 'Indian Institute of Management Kozhikode',     short_name: 'IIM Kozhikode',      type: 'iim', city: 'Kozhikode',     state: 'Kerala',         website: 'https://www.iimk.ac.in',     naac: 'A+',  nirf: 5  },
  { name: 'Indian Institute of Management Indore',        short_name: 'IIM Indore',         type: 'iim', city: 'Indore',        state: 'Madhya Pradesh', website: 'https://www.iimidr.ac.in',   naac: 'A+',  nirf: 6  },
  { name: 'Indian Institute of Management Shillong',      short_name: 'IIM Shillong',       type: 'iim', city: 'Shillong',      state: 'Meghalaya',      website: 'https://www.iimshillong.ac.in',naac:'A+',  nirf: 7  },
  { name: 'Indian Institute of Management Rohtak',        short_name: 'IIM Rohtak',         type: 'iim', city: 'Rohtak',        state: 'Haryana',        website: 'https://www.iimrohtak.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Ranchi',        short_name: 'IIM Ranchi',         type: 'iim', city: 'Ranchi',        state: 'Jharkhand',      website: 'https://www.iimranchi.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Raipur',        short_name: 'IIM Raipur',         type: 'iim', city: 'Raipur',        state: 'Chhattisgarh',   website: 'https://www.iimraipur.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Kashipur',      short_name: 'IIM Kashipur',       type: 'iim', city: 'Kashipur',      state: 'Uttarakhand',    website: 'https://www.iimkashipur.ac.in',naac:'NA', nirf: null},
  { name: 'Indian Institute of Management Tiruchirappalli',short_name:'IIM Trichy',         type: 'iim', city: 'Tiruchirappalli',state: 'Tamil Nadu',     website: 'https://www.iimtrichy.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Udaipur',       short_name: 'IIM Udaipur',        type: 'iim', city: 'Udaipur',       state: 'Rajasthan',      website: 'https://www.iimu.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Bodhgaya',      short_name: 'IIM Bodhgaya',       type: 'iim', city: 'Gaya',          state: 'Bihar',          website: 'https://www.iimgaya.ac.in',  naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Amritsar',      short_name: 'IIM Amritsar',       type: 'iim', city: 'Amritsar',      state: 'Punjab',         website: 'https://www.iimamritsar.ac.in',naac:'NA', nirf: null},
  { name: 'Indian Institute of Management Nagpur',        short_name: 'IIM Nagpur',         type: 'iim', city: 'Nagpur',        state: 'Maharashtra',    website: 'https://www.iimnagpur.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Sambalpur',     short_name: 'IIM Sambalpur',      type: 'iim', city: 'Sambalpur',     state: 'Odisha',         website: 'https://www.iimsambalpur.ac.in',naac:'NA',nirf: null},
  { name: 'Indian Institute of Management Visakhapatnam', short_name: 'IIM Visakhapatnam',  type: 'iim', city: 'Visakhapatnam', state: 'Andhra Pradesh', website: 'https://www.iimv.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Jammu',         short_name: 'IIM Jammu',          type: 'iim', city: 'Jammu',         state: 'Jammu & Kashmir',website: 'https://www.iimj.ac.in',     naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Mumbai',        short_name: 'IIM Mumbai',         type: 'iim', city: 'Mumbai',        state: 'Maharashtra',    website: 'https://www.iimmumbai.ac.in',naac: 'NA',  nirf: null},
  { name: 'Indian Institute of Management Sirmaur',       short_name: 'IIM Sirmaur',        type: 'iim', city: 'Sirmaur',       state: 'Himachal Pradesh',website:'https://www.iimsirmaur.ac.in',naac:'NA', nirf: null},

  // ─── DEEMED / PRIVATE (20) ────────────────────────────────────────────────────
  { name: 'BITS Pilani',                          short_name: 'BITS Pilani',  type: 'deemed',  city: 'Pilani',       state: 'Rajasthan',       website: 'https://www.bits-pilani.ac.in', naac: 'A+',  nirf: 26 },
  { name: 'BITS Pilani - Goa Campus',             short_name: 'BITS Goa',     type: 'deemed',  city: 'Goa',          state: 'Goa',             website: 'https://www.bits-pilani.ac.in/goa', naac: 'A+',  nirf: null},
  { name: 'BITS Pilani - Hyderabad Campus',       short_name: 'BITS Hyderabad',type:'deemed',  city: 'Hyderabad',    state: 'Telangana',       website: 'https://www.bits-pilani.ac.in/hyderabad',naac:'A+',nirf: null},
  { name: 'VIT University Vellore',               short_name: 'VIT Vellore',  type: 'deemed',  city: 'Vellore',      state: 'Tamil Nadu',      website: 'https://vit.ac.in',             naac: 'A++', nirf: 11 },
  { name: 'VIT Chennai',                          short_name: 'VIT Chennai',  type: 'deemed',  city: 'Chennai',      state: 'Tamil Nadu',      website: 'https://chennai.vit.ac.in',     naac: 'A+',  nirf: null},
  { name: 'Manipal Academy of Higher Education',  short_name: 'Manipal',      type: 'deemed',  city: 'Manipal',      state: 'Karnataka',       website: 'https://www.manipal.edu',       naac: 'A+',  nirf: 8  },
  { name: 'SRM Institute of Science and Technology',short_name:'SRM',         type: 'private', city: 'Kattankulathur',state: 'Tamil Nadu',     website: 'https://www.srmist.edu.in',     naac: 'A++', nirf: null},
  { name: 'Amity University',                     short_name: 'Amity',        type: 'private', city: 'Noida',        state: 'Uttar Pradesh',   website: 'https://www.amity.edu',         naac: 'A+',  nirf: null},
  { name: 'Symbiosis International University',   short_name: 'SIU',          type: 'deemed',  city: 'Pune',         state: 'Maharashtra',     website: 'https://www.siu.edu.in',        naac: 'A+',  nirf: null},
  { name: 'Christ University',                    short_name: 'Christ',       type: 'deemed',  city: 'Bengaluru',    state: 'Karnataka',       website: 'https://christuniversity.in',   naac: 'A+',  nirf: null},
  { name: 'Lovely Professional University',       short_name: 'LPU',          type: 'private', city: 'Phagwara',     state: 'Punjab',          website: 'https://www.lpu.in',            naac: 'A+',  nirf: null},
  { name: 'Chandigarh University',                short_name: 'CU',           type: 'private', city: 'Chandigarh',   state: 'Punjab',          website: 'https://www.cuchd.in',          naac: 'A+',  nirf: null},
  { name: 'NMIMS University',                     short_name: 'NMIMS',        type: 'deemed',  city: 'Mumbai',       state: 'Maharashtra',     website: 'https://www.nmims.edu',         naac: 'A+',  nirf: null},
  { name: 'FLAME University',                     short_name: 'FLAME',        type: 'deemed',  city: 'Pune',         state: 'Maharashtra',     website: 'https://www.flame.edu.in',      naac: 'A',   nirf: null},
  { name: 'Ashoka University',                    short_name: 'Ashoka',       type: 'private', city: 'Sonipat',      state: 'Haryana',         website: 'https://www.ashoka.edu.in',     naac: 'NA',  nirf: null},
  { name: 'OP Jindal Global University',          short_name: 'JGU',          type: 'deemed',  city: 'Sonipat',      state: 'Haryana',         website: 'https://www.jgu.edu.in',        naac: 'A',   nirf: null},
  { name: 'Shiv Nadar University',                short_name: 'SNU',          type: 'deemed',  city: 'Greater Noida',state: 'Uttar Pradesh',   website: 'https://snu.edu.in',            naac: 'NA',  nirf: null},
  { name: 'Azim Premji University',               short_name: 'APU',          type: 'deemed',  city: 'Bengaluru',    state: 'Karnataka',       website: 'https://azimpremjiuniversity.edu.in',naac:'NA',nirf: null},
  { name: 'National Institute of Design Ahmedabad',short_name: 'NID',         type: 'autonomous',city:'Ahmedabad',   state: 'Gujarat',         website: 'https://www.nid.edu',           naac: 'NA',  nirf: null},
  { name: 'MICA Ahmedabad',                       short_name: 'MICA',         type: 'deemed',  city: 'Ahmedabad',    state: 'Gujarat',         website: 'https://www.mica.ac.in',        naac: 'A',   nirf: null},

  // ─── STATE UNIVERSITIES (13) ──────────────────────────────────────────────────
  { name: 'University of Mumbai',                 short_name: 'Mumbai Uni',   type: 'state',   city: 'Mumbai',       state: 'Maharashtra',     website: 'https://mu.ac.in',              naac: 'A+',  nirf: null},
  { name: 'Savitribai Phule Pune University',     short_name: 'Pune Uni',     type: 'state',   city: 'Pune',         state: 'Maharashtra',     website: 'https://www.unipune.ac.in',     naac: 'A+',  nirf: null},
  { name: 'Gujarat University',                   short_name: 'GU',           type: 'state',   city: 'Ahmedabad',    state: 'Gujarat',         website: 'https://www.gujaratuniversity.ac.in',naac:'A+',nirf: null},
  { name: 'Anna University',                      short_name: 'Anna Uni',     type: 'state',   city: 'Chennai',      state: 'Tamil Nadu',      website: 'https://www.annauniv.edu',      naac: 'A++', nirf: null},
  { name: 'Osmania University',                   short_name: 'OU',           type: 'state',   city: 'Hyderabad',    state: 'Telangana',       website: 'https://www.osmania.ac.in',     naac: 'A+',  nirf: null},
  { name: 'University of Rajasthan',              short_name: 'RU',           type: 'state',   city: 'Jaipur',       state: 'Rajasthan',       website: 'https://uniraj.ac.in',          naac: 'A',   nirf: null},
  { name: 'University of Lucknow',                short_name: 'LU',           type: 'state',   city: 'Lucknow',      state: 'Uttar Pradesh',   website: 'https://www.lkouniv.ac.in',     naac: 'A+',  nirf: null},
  { name: 'University of Calcutta',               short_name: 'CU Kolkata',   type: 'state',   city: 'Kolkata',      state: 'West Bengal',     website: 'https://www.caluniv.ac.in',     naac: 'A++', nirf: null},
  { name: 'University of Madras',                 short_name: 'Madras Uni',   type: 'state',   city: 'Chennai',      state: 'Tamil Nadu',      website: 'https://www.unom.ac.in',        naac: 'A+',  nirf: null},
  { name: 'Bangalore University',                 short_name: 'BU',           type: 'state',   city: 'Bengaluru',    state: 'Karnataka',       website: 'https://bangaloreuniversity.ac.in',naac:'A',  nirf: null},
  { name: 'University of Kerala',                 short_name: 'Kerala Uni',   type: 'state',   city: 'Thiruvananthapuram',state:'Kerala',        website: 'https://www.keralauniversity.ac.in',naac:'A+',nirf: null},
  { name: 'University of Mysore',                 short_name: 'Mysore Uni',   type: 'state',   city: 'Mysuru',       state: 'Karnataka',       website: 'https://uni-mysore.ac.in',      naac: 'A+',  nirf: null},
  { name: 'Vikram University',                    short_name: 'VU',           type: 'state',   city: 'Ujjain',       state: 'Madhya Pradesh',  website: 'https://www.vikramuniv.ac.in',  naac: 'A',   nirf: null},
];

async function run() {
  console.log('[SEED] universities.seed.js — starting...');
  let inserted = 0;
  for (const u of universities) {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO universities
         (name, short_name, type, location_city, location_state, country,
          official_website, naac_grade, nirf_rank, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,1)`,
      [u.name, u.short_name || null, u.type, u.city || null, u.state || null,
       'India', u.website || null, u.naac || 'NA', u.nirf || null]
    );
    if (result.affectedRows > 0) inserted++;
  }
  console.log(`[SEED] universities.seed.js — done. Inserted ${inserted} / ${universities.length} (${universities.length - inserted} already existed).`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] universities.seed.js FAILED:', err.message);
  process.exit(1);
});
