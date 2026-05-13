import AsyncStorage from "@react-native-async-storage/async-storage";
import { performBackup } from "./backupService";

const KEY = "wordbook_words";

const SEED = [
  {
    id: "1",
    word: "Eloquent",
    type: "adjective",
    phonetic: "/ˈɛləkwənt/",
    meaning: "Fluent or persuasive in speaking or writing.",
    meaningGu: "પ્રવાહી અથવા પ્રભાવી રીતે બોલવું અથવા લખવું.",
    meaningHi: "धाराप्रवाह या प्रेरक तरीके से बोलना या लिखना।",
    example: "She gave an eloquent speech that moved the audience.",
    notes: "El + eloquent = words flowing out elegantly.",
    date: Date.now(),
  },
  {
    id: "2",
    word: "Persevere",
    type: "verb",
    phonetic: "/ˌpɜːrsɪˈvɪər/",
    meaning: "Continue steadfastly despite difficulty or delay.",
    meaningGu: "મુશ્કેલી છતાં મક્કમ રહેવું.",
    meaningHi: "कठिनाई के बावजूद दृढ़तापूर्वक जारी रखना।",
    example: "You must persevere if you want to achieve your goals.",
    notes: "Per = through. Push through every hardship!",
    date: Date.now(),
  },
];

export const getWords = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (data) return JSON.parse(data);
    await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
    return SEED;
  } catch {
    return SEED;
  }
};

export const saveWord = async (word) => {
  const words = await getWords();
  const idx = words.findIndex((w) => w.id === word.id);
  if (idx >= 0) words[idx] = word;
  else words.push(word);
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
  // Perform backup in background, don't await it
  performBackup().catch(() => {});
};

export const deleteWord = async (id) => {
  const words = await getWords();
  const updated = words.filter((w) => w.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  // Perform backup in background, don't await it
  performBackup().catch(() => {});
};
