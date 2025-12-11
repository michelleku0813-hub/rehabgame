const getItem = key => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const removeItem = key => {
  localStorage.removeItem(key);
};

export default {
  getItem,
  setItem,
  removeItem,
};


