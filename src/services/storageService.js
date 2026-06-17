import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteWordFromCloud, performBackup } from "./backupService";

const KEY = "wordbook_words";

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
    let words = data ? JSON.parse(data) : SEED;
    
    // Migration: Convert old numeric IDs to UUIDs
    let migrated = false;
    const updatedWords = words.map((w) => {
      if (!w.id || !w.id.includes("-")) {
        w.id = uuidv4();
        migrated = true;
      }
      return w;
    });

    if (migrated) {
      await AsyncStorage.setItem(KEY, JSON.stringify(updatedWords));
      // Trigger a backup to sync the new UUIDs to the cloud
      performBackup().catch(() => {});
    }

    return updatedWords;
  } catch {
    return SEED;
  }
};

export const saveWord = async (word) => {
  const words = await getWords();

  // Ensure the word has a valid UUID if it's new
  if (!word.id || !word.id.includes("-")) {
    word.id = uuidv4();
  }

  const idx = words.findIndex((w) => w.id === word.id);

  if (idx >= 0) {
    // Editing existing word — update in place
    words[idx] = word;
  } else {
    // Adding new word — check for duplicate name (case-insensitive)
    const duplicate = words.find(
      (w) => w.word.trim().toLowerCase() === word.word.trim().toLowerCase(),
    );
    if (duplicate) {
      return { duplicate: true, existing: duplicate };
    }
    words.push(word);
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(words));
  performBackup().catch(() => {});
  return { duplicate: false };
};

export const deleteWord = async (id) => {
  const words = await getWords();
  const updated = words.filter((w) => w.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  // Perform backup in background and explicit cloud delete if enabled
  performBackup().catch(() => {});
  deleteWordFromCloud(id).catch(() => {});
};

export const clearWords = async () => {
  await AsyncStorage.removeItem(KEY);
  return SEED;
};
