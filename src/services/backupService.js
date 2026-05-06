/* eslint-disable import/namespace */
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

const BACKUP_KEY = 'wordbook_auto_backup';
const WORDS_KEY = 'wordbook_words';

const BACKUP_PATH = Platform.OS === 'android'
  ? 'file:///storage/emulated/0/Download/mywordbook_backup.json'
  : FileSystem.documentDirectory + 'mywordbook_backup.json';

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return (
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

export const isAutoBackupEnabled = async () => {
  const value = await AsyncStorage.getItem(BACKUP_KEY);
  return value === 'true';
};

export const setAutoBackupEnabled = async (enabled) => {
  await AsyncStorage.setItem(BACKUP_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    await performBackup(); // perform immediately when turned on
  }
};

export const performBackup = async () => {
  try {
    const enabled = await isAutoBackupEnabled();
    if (!enabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission && Platform.OS === 'android') {
      // Sometimes permission is denied but we can still write to Downloads using SAF,
      // but sticking to direct path for simplicity.
      return;
    }

    const wordsData = await AsyncStorage.getItem(WORDS_KEY);
    if (wordsData) {
      await FileSystem.writeAsStringAsync(BACKUP_PATH, wordsData);
      console.log('Backup successful to', BACKUP_PATH);
    }
  } catch (err) {
    console.log('Backup failed:', err);
  }
};

export const autoRestoreIfAvailable = async () => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission && Platform.OS === 'android') return false;

    const fileInfo = await FileSystem.getInfoAsync(BACKUP_PATH);
    if (fileInfo.exists) {
      const backupData = await FileSystem.readAsStringAsync(BACKUP_PATH);
      
      const parsedData = JSON.parse(backupData);
      
      // Only restore if it looks like an array of words
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Check current data
        const currentData = await AsyncStorage.getItem(WORDS_KEY);
        // Only override if current data is null or empty, or only contains default seed length
        // We'll just check if it's not set or has very few items (like the default 2 items)
        let shouldRestore = false;
        if (!currentData) {
          shouldRestore = true;
        } else {
          const parsedCurrent = JSON.parse(currentData);
          if (parsedCurrent.length <= 2) {
             shouldRestore = true;
          }
        }

        if (shouldRestore) {
          await AsyncStorage.setItem(WORDS_KEY, backupData);
          await AsyncStorage.setItem(BACKUP_KEY, 'true'); // Auto-enable backup since we restored from one
          console.log('Restored backup successfully');
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.log('Restore failed:', err);
    return false;
  }
};
