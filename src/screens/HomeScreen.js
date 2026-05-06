import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AZStrip from "../components/AZStrip";
import WordCard from "../components/WordCard";
import colors from "../constants/colors";
import { getWords } from "../services/storageService";

export default function HomeScreen({ navigation }) {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");

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
            {words.length} words
          </Text>
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
    </SafeAreaView>
  );
}
