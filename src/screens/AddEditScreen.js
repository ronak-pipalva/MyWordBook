import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";
import { searchWord } from "../services/dictionaryService";
import { saveWord } from "../services/storageService";
import { translate } from "../services/translationService";

const EMPTY_FORM = {
  id: "",
  word: "",
  type: "",
  phonetic: "",
  meaning: "",
  meaningGu: "",
  meaningHi: "",
  example: "",
  notes: "",
  date: 0,
};

export default function AddEditScreen({ navigation, route }) {
  const { mode, word: editWord } = route.params || {};
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingDict, setLoadingDict] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isEdit && editWord) {
      setFormData(editWord);
    }
  }, []);

  const handleWordChange = (text) => {
    setFormData((f) => ({ ...f, word: text }));
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoadingDict(true);
        const results = await searchWord(text);
        setSuggestions(results || []);
        setLoadingDict(false);
      }, 400);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (entry) => {
    const word = entry.word;
    const phonetic = entry.phonetics?.find((p) => p.text)?.text || "";
    const meaning0 = entry.meanings?.[0];
    const type = meaning0?.partOfSpeech || "";
    const def = meaning0?.definitions?.[0];
    const meaning = def?.definition || "";
    const example = def?.example || "";

    setFormData((f) => ({ ...f, word, phonetic, type, meaning, example }));
    setShowDropdown(false);
    setSuggestions([]);

    if (meaning) {
      setLoadingTranslation(true);
      const [gu, hi] = await Promise.all([
        translate(meaning, "en|gu"),
        translate(meaning, "en|hi"),
      ]);
      setFormData((f) => ({ ...f, meaningGu: gu, meaningHi: hi }));
      setLoadingTranslation(false);
    }
  };

  const handleSave = async () => {
    if (!formData.word.trim()) {
      Alert.alert("Missing word", "Please enter a word.");
      return;
    }
    setSaving(true);
    const wordObj = {
      ...formData,
      id: isEdit ? formData.id : Date.now().toString(),
      date: isEdit ? formData.date : Date.now(),
    };
    await saveWord(wordObj);
    setSaving(false);
    navigation.goBack();
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 18,
            fontWeight: "600",
            color: colors.textPrimary,
          }}
        >
          {isEdit ? "Edit Word" : "Add Word"}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" style={{ padding: 16 }}>
          {/* Word Input + Dropdown */}
          <View style={{ zIndex: 100 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textSecondary,
                marginBottom: 5,
              }}
            >
              Word *
            </Text>
            <TextInput
              style={inputStyle}
              value={formData.word}
              onChangeText={handleWordChange}
              placeholder="e.g. Eloquent"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {showDropdown && (suggestions.length > 0 || loadingDict) ? (
              <View
                style={{
                  position: "absolute",
                  top: 68,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  elevation: 8,
                  maxHeight: 220,
                }}
              >
                {loadingDict ? (
                  <ActivityIndicator
                    color={colors.primary}
                    style={{ padding: 16 }}
                  />
                ) : (
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item: entry }) => {
                      const p =
                        entry.phonetics?.find((ph) => ph.text)?.text || "";
                      const t = entry.meanings?.[0]?.partOfSpeech || "";
                      return (
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: 0.5,
                            borderBottomColor: colors.borderLight,
                          }}
                          onPress={() => handleSelectSuggestion(entry)}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "600",
                              color: colors.textPrimary,
                            }}
                          >
                            {entry.word}
                          </Text>
                          <View style={{ flexDirection: "row" }}>
                            {p ? (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.textSecondary,
                                  fontStyle: "italic",
                                }}
                              >
                                {p}
                              </Text>
                            ) : null}
                            {t ? (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.primaryMid,
                                  fontStyle: "italic",
                                }}
                              >
                                {p ? " \u00B7 " + t : t}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
                {!loadingDict &&
                suggestions.length === 0 &&
                formData.word.length >= 2 ? (
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textMuted,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    Word not found — fill fields manually
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Phonetic */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
              marginBottom: 5,
              marginTop: 4,
            }}
          >
            Phonetic
          </Text>
          <TextInput
            style={inputStyle}
            value={formData.phonetic}
            onChangeText={(v) => setFormData((f) => ({ ...f, phonetic: v }))}
            placeholder="/fəˈnɛtɪk/"
          />

          {/* Type Picker */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Type (Part of speech)
          </Text>
          <View
            style={{
              borderWidth: 0.5,
              borderColor: colors.border,
              borderRadius: 10,
              backgroundColor: colors.surface,
              marginBottom: 14,
            }}
          >
            <Picker
              selectedValue={formData.type}
              onValueChange={(v) => setFormData((f) => ({ ...f, type: v }))}
            >
              <Picker.Item label="— select type —" value="" />
              <Picker.Item label="noun" value="noun" />
              <Picker.Item label="verb" value="verb" />
              <Picker.Item label="adjective" value="adjective" />
              <Picker.Item label="adverb" value="adverb" />
              <Picker.Item label="phrase" value="phrase" />
              <Picker.Item label="idiom" value="idiom" />
              <Picker.Item label="other" value="other" />
            </Picker>
          </View>

          {/* Meaning English */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Meaning (English)
          </Text>
          <TextInput
            style={[inputStyle, { minHeight: 70 }]}
            multiline
            numberOfLines={3}
            value={formData.meaning}
            onChangeText={(v) => setFormData((f) => ({ ...f, meaning: v }))}
          />

          {/* Meaning Gujarati */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.teal,
              marginBottom: 5,
            }}
          >
            Meaning (ગુજરાતી)
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.tealBg,
                  minHeight: 50,
                  color: colors.tealDark,
                },
              ]}
              multiline
              numberOfLines={2}
              value={formData.meaningGu}
              onChangeText={(v) => setFormData((f) => ({ ...f, meaningGu: v }))}
              placeholderTextColor={colors.teal}
            />
            {loadingTranslation ? (
              <ActivityIndicator
                color={colors.teal}
                style={{ position: "absolute", right: 10, top: 10 }}
              />
            ) : null}
          </View>

          {/* Meaning Hindi */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.amber,
              marginBottom: 5,
            }}
          >
            Meaning (हिंदी)
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[
                inputStyle,
                {
                  backgroundColor: colors.amberBg,
                  minHeight: 50,
                  color: colors.amberDark,
                },
              ]}
              multiline
              numberOfLines={2}
              value={formData.meaningHi}
              onChangeText={(v) => setFormData((f) => ({ ...f, meaningHi: v }))}
              placeholderTextColor={colors.amber}
            />
            {loadingTranslation ? (
              <ActivityIndicator
                color={colors.amber}
                style={{ position: "absolute", right: 10, top: 10 }}
              />
            ) : null}
          </View>

          {/* Example */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Example sentence
          </Text>
          <TextInput
            style={[inputStyle, { minHeight: 70 }]}
            multiline
            numberOfLines={3}
            value={formData.example}
            onChangeText={(v) => setFormData((f) => ({ ...f, example: v }))}
            placeholder="Use the word in a sentence..."
          />

          {/* Notes */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            My notes / mnemonic
          </Text>
          <TextInput
            style={[inputStyle, { minHeight: 50 }]}
            multiline
            numberOfLines={2}
            value={formData.notes}
            onChangeText={(v) => setFormData((f) => ({ ...f, notes: v }))}
            placeholder="Your trick to remember this word..."
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 15,
              alignItems: "center",
              marginTop: 24,
              marginBottom: 32,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 16, fontWeight: "600" }}
            >
              {saving ? "Saving..." : "Save Word"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
