export const generateRoomCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const length = 6;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export const generateUserName = () => {
  const adjectives = [
    'Swift', 'Happy', 'Clever', 'Bright', 'Agile',
    'Bold', 'Brave', 'Calm', 'Cool', 'Eager',
    'Fair', 'Kind', 'Lively', 'Proud', 'Smart', 
    'Witty', 'Zesty', 'Keen', 'Jolly', 'Honest'
  ];
  
  const nouns = [
    'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox',
    'Wolf', 'Bear', 'Hawk', 'Lion', 'Owl',
    'Panther', 'Raven', 'Shark', 'Whale', 'Zebra',
    'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Wizard'
  ];
  
  const randomNumber = Math.floor(Math.random() * 100);
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${randomNumber}`;
};

export const generateColor = () => {
  const colors = [
    '#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666',
    '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

export const formatRoomCode = (code) => {
  if (!code) return '';
  return code.toUpperCase().match(/.{1,3}/g).join(' ');
}; 