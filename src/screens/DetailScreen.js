import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SectionBox from "../components/SectionBox";
import colors from "../constants/colors";
import { deleteWord } from "../services/storageService";

export default function DetailScreen({ navigation, route }) {
  const { word } = route.params;
  const insets = useSafeAreaInsets();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(word.word, { language: "en-US", rate: 0.8 });
      setIsSpeaking(true);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete word?", `"${word.word}" will be permanently deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteWord(word.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 17,
            fontWeight: "600",
            color: colors.textPrimary,
          }}
        >
          {word.word}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddEdit", { mode: "edit", word })}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ padding: 20 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text
          style={{ fontSize: 28, fontWeight: "700", color: colors.textPrimary }}
        >
          {word.word}
        </Text>

        {word.phonetic ? (
          <Text
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            {word.phonetic}
          </Text>
        ) : null}

        {word.type ? (
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                backgroundColor: colors.primaryLight,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.primaryDark,
                  fontWeight: "500",
                }}
              >
                {word.type}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Listen Button */}
        <TouchableOpacity
          onPress={handleSpeak}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primaryLight,
            borderWidth: 1,
            borderColor: colors.primaryMid,
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: 13,
            alignSelf: "flex-start",
            marginTop: 16,
          }}
        >
          <MaterialCommunityIcons
            name={isSpeaking ? "stop-circle" : "volume-high"}
            size={22}
            color={colors.primary}
          />
          <Text
            style={{
              color: colors.primary,
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 8,
            }}
          >
            {isSpeaking ? "Stop" : "Listen to pronunciation"}
          </Text>
        </TouchableOpacity>

        {/* Section Boxes */}
        <View style={{ marginTop: 20 }}>
          <SectionBox
            label="Meaning (English)"
            text={word.meaning}
            bgColor={colors.surface}
            textColor={colors.textPrimary}
          />
          <SectionBox
            label="Meaning (ગુજરાતી)"
            text={word.meaningGu}
            bgColor={colors.tealBg}
            textColor={colors.tealDark}
            labelColor={colors.teal}
          />
          <SectionBox
            label="Meaning (हिंदी)"
            text={word.meaningHi}
            bgColor={colors.amberBg}
            textColor={colors.amberDark}
            labelColor={colors.amber}
          />
          <SectionBox
            label="Example sentence"
            text={word.example}
            bgColor={colors.surface}
            textColor={colors.textPrimary}
            italic
          />
          <SectionBox
            label="My notes"
            text={word.notes}
            bgColor={colors.surface}
            textColor={colors.textPrimary}
          />

          {word.synonyms && word.synonyms.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Synonyms
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {word.synonyms.map((syn, index) => (
                  <TouchableOpacity
                    key={`syn-${index}`}
                    onPress={() => {
                      Clipboard.setStringAsync(syn);
                    }}
                    style={{
                      backgroundColor: colors.primaryLight,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: colors.primaryMid,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primaryDark,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {syn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {word.antonyms && word.antonyms.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Antonyms
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {word.antonyms.map((ant, index) => (
                  <TouchableOpacity
                    key={`ant-${index}`}
                    onPress={() => {
                      Clipboard.setStringAsync(ant);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {ant}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Date */}
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 16 }}>
          Added on{" "}
          {new Date(word.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("AddEdit", { mode: "edit", word })}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 10,
            padding: 13,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={colors.primary}
          />
          <Text
            style={{
              color: colors.primary,
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 6,
            }}
          >
            Edit Word
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            width: 48,
            height: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 10,
          }}
        >
          <MaterialCommunityIcons
            name="delete"
            size={22}
            color={colors.danger}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
