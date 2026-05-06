import axios from 'axios';

export const searchWord = async (word) => {
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    return res.data;
  } catch {
    return null;
  }
};
