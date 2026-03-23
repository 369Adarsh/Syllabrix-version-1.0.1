const BOARD_TYPES = {
  CBSE: 'CBSE', ICSE: 'ICSE', STATE_BOARD: 'state_board',
  IB: 'IB', CAMBRIDGE: 'Cambridge', NIOS: 'NIOS', OTHER: 'other',
};
const BOARD_TYPE_LIST = Object.values(BOARD_TYPES);
const MEDIUM_TYPES = {
  ENGLISH: 'english', HINDI: 'hindi', REGIONAL: 'regional', BILINGUAL: 'bilingual',
};
const MEDIUM_TYPE_LIST = Object.values(MEDIUM_TYPES);
module.exports = { BOARD_TYPES, BOARD_TYPE_LIST, MEDIUM_TYPES, MEDIUM_TYPE_LIST };
