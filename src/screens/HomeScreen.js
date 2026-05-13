import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AZStrip from "../components/AZStrip";
import WordCard from "../components/WordCard";
import AuthModal from "../components/AuthModal";
import colors from "../constants/colors";
import {
  autoRestoreIfAvailable,
  getCurrentUser,
  isAutoBackupEnabled,
  logout,
  setAutoBackupEnabled,
} from "../services/backupService";
import { deleteWord, getWords } from "../services/storageService";

export default function HomeScreen({ navigation }) {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    (async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const restored = await autoRestoreIfAvailable();
      if (restored) {
        const data = await getWords();
        setWords(data);
      }
      const backupEnabled = await isAutoBackupEnabled();
      setAutoBackup(backupEnabled);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await getWords();
        setWords(data);
      })();
    }, []),
  );

  const filteredWords = useMemo(() => {
    return words
      .filter((w) => {
        const letterMatch =
          selectedLetter === "ALL" ||
          w.word[0].toUpperCase() === selectedLetter;
        const searchMatch =
          !searchQuery ||
          w.word.toLowerCase().includes(searchQuery.toLowerCase());
        return letterMatch && searchMatch;
      })
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [words, selectedLetter, searchQuery]);

  const handleSpeak = (word) => {
    Speech.speak(word, { language: "en-US", rate: 0.8 });
  };

  const toggleAutoBackup = async (value) => {
    if (value && !user) {
      setAuthVisible(true);
      return;
    }
    setAutoBackup(value);
    await setAutoBackupEnabled(value);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          setUser(null);
          setAutoBackup(false);
          await setAutoBackupEnabled(false);
        },
      },
    ]);
  };

  const handleAuthSuccess = async (newUser) => {
    setUser(newUser);
    setAutoBackup(true);
    await setAutoBackupEnabled(true);
    // After login, try to restore words if local is empty
    const restored = await autoRestoreIfAvailable();
    if (restored) {
      const data = await getWords();
      setWords(data);
    }
  };

  const handleDeleteCard = (item) => {
    Alert.alert("Delete word?", `"${item.word}" will be permanently deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Update UI immediately by filtering locally
          setWords((prevWords) => prevWords.filter((w) => w.id !== item.id));
          // Then perform the actual delete in background
          await deleteWord(item.id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <Text
          style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}
        >
          My Word Book
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              backgroundColor: colors.primaryLight,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.primaryDark,
                fontWeight: "600",
              }}
            >
              {filteredWords.length} words
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={{
          backgroundColor: colors.surface,
          borderWidth: 0.5,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 15,
          marginHorizontal: 16,
          marginBottom: 10,
        }}
        placeholder="Search words..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <AZStrip
        words={words}
        selectedLetter={selectedLetter}
        onSelect={setSelectedLetter}
      />
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordCard
            item={item}
            onPress={() => navigation.navigate("Detail", { word: item })}
            onSpeak={() => handleSpeak(item.word)}
            onDelete={() => handleDeleteCard(item)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={48}
              color={colors.border}
            />
            <Text
              style={{ fontSize: 16, color: colors.textMuted, marginTop: 12 }}
            >
              No words yet
            </Text>
            <Text
              style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}
            >
              Tap + to add your first word!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 28,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        onPress={() => navigation.navigate("AddEdit", { mode: "add" })}
      >
        <MaterialCommunityIcons name="plus" size={30} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Settings
              </Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: colors.textPrimary,
                  }}
                >
                  Cloud Backup
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Sync your words securely to the cloud.
                </Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={toggleAutoBackup}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {user && (
              <View
                style={{
                  marginTop: 10,
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  Logged in as <Text style={{ fontWeight: "600", color: colors.textPrimary }}>{user.email}</Text>
                </Text>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: "600" }}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </SafeAreaView>
  );
}
