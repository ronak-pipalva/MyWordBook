import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const BACKUP_KEY = "wordbook_auto_backup";
const WORDS_KEY = "wordbook_words";

// Auth Functions
export const register = async (email, password) => {
  return await supabase.auth.signUp({ email, password });
};

export const login = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const resetPassword = async (email) => {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create new accounts via forgot password
    },
  });
};

export const verifyResetOtp = async (email, token) => {
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: "email", // Magic code uses 'email' type
  });
};

export const updatePassword = async (newPassword) => {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
};

export const logout = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Backup Functions
export const isAutoBackupEnabled = async () => {
  const value = await AsyncStorage.getItem(BACKUP_KEY);
  return value === "true";
};

export const setAutoBackupEnabled = async (enabled) => {
  await AsyncStorage.setItem(BACKUP_KEY, enabled ? "true" : "false");
  if (enabled) {
    await performBackup();
  }
};

export const performBackup = async () => {
  try {
    const enabled = await isAutoBackupEnabled();
    if (!enabled) return;

    const user = await getCurrentUser();
    if (!user) return;

    const wordsData = await AsyncStorage.getItem(WORDS_KEY);
    if (!wordsData) return;

    const words = JSON.parse(wordsData);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return;
    }
    
    // Call sync-words edge function
    const { data, error } = await supabase.functions.invoke("sync-words", {
      body: { words },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Backup error:", error);
      throw error;
    }
    console.log("Backup successful");
  } catch (err) {
    console.error("Backup failed:", err);
  }
};

export const deleteWordFromCloud = async (wordId) => {
  try {
    const enabled = await isAutoBackupEnabled();
    if (!enabled) return;

    const user = await getCurrentUser();
    if (!user) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const { data, error } = await supabase.functions.invoke("delete-word", {
      body: { wordId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error.context) {
        try {
          const body = await error.context.json();
          errorMessage = body.error || errorMessage;
        } catch (e) {
          // ignore
        }
      }
      console.error("Cloud delete error:", errorMessage);
      throw new Error(errorMessage);
    }
    console.log("Cloud delete successful");
  } catch (err) {
    console.error("Cloud delete failed:", err);
  }
};

export const autoRestoreIfAvailable = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }
    
    // Call restore-words edge function
    const { data, error } = await supabase.functions.invoke("restore-words", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }

    if (data && data.words && Array.isArray(data.words) && data.words.length > 0) {
      const currentData = await AsyncStorage.getItem(WORDS_KEY);
      let shouldRestore = false;

      if (!currentData) {
        shouldRestore = true;
      } else {
        const parsedCurrent = JSON.parse(currentData);
        // Only restore if local data is very small (default seeds)
        if (parsedCurrent.length <= 2) {
          shouldRestore = true;
        }
      }

      if (shouldRestore) {
        await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(data.words));
        await AsyncStorage.setItem(BACKUP_KEY, "true");
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
};
