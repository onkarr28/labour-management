// Generate unique login ID and password for workers

const generateLoginId = (name) => {
  // Format: FirstName_RANDOMNUMBER (e.g., Rajesh_4827)
  const firstName = name.split(' ')[0].toLowerCase();
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
  return `${firstName}_${randomNum}`;
};

const generatePassword = (name, mobile) => {
  // Format: FirstName@(first 4 digits of phone) (e.g., Rajesh@9876)
  const firstName = name.split(' ')[0];
  const first4Digits = mobile.substring(0, 4);
  return `${firstName}@${first4Digits}`;
};

export const generateWorkerCredentials = (name, mobile) => {
  return {
    loginId: generateLoginId(name),
    password: generatePassword(name, mobile),
  };
};

export default {
  generateWorkerCredentials,
};
