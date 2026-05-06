import axios from 'axios';

export const translate = async (text, langpair) => {
  try {
    const res = await axios.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair },
    });
    return res.data?.responseData?.translatedText || '';
  } catch {
    return '';
  }
};
