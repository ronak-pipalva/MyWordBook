import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

export default function AZStrip({ words, selectedLetter, onSelect }) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const wordLetters = new Set(words.map((w) => w.word[0].toUpperCase()));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10, paddingLeft: 16 }}>
      <TouchableOpacity onPress={() => onSelect('ALL')} style={[styles.pill, selectedLetter === 'ALL' && styles.activePill]}>
        <Text style={[styles.pillText, selectedLetter === 'ALL' && styles.activePillText]}>All</Text>
      </TouchableOpacity>
      {letters.map((letter) => {
        const hasWords = wordLetters.has(letter);
        const isActive = selectedLetter === letter;
        return (
          <TouchableOpacity key={letter} onPress={() => onSelect(letter)} style={[styles.pill, isActive && styles.activePill]}>
            <Text style={[styles.pillText, isActive && styles.activePillText, !hasWords && styles.emptyPillText]}>
              {letter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = {
  pill: { minWidth: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 6, paddingHorizontal: 10 },
  activePill: { backgroundColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  activePillText: { color: colors.white },
  emptyPillText: { color: colors.textMuted },
};
