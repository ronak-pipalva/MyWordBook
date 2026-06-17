import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';

export default function WordCard(props) {
  const { item, onPress, onSpeak, onDelete } = props;
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.word[0].toUpperCase()}</Text>
      </View>
      <View style={styles.center}>
        <View style={styles.wordRow}>
          <Text style={styles.wordText}>{item.word}</Text>
          {item.type ? <Text style={styles.typeText}>{' \u00B7 ' + item.type}</Text> : null}
        </View>
        {item.meaning ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            <Text style={styles.meaningText} numberOfLines={expanded ? undefined : 1}>
              {item.meaning}
            </Text>
            {!expanded && item.meaning.length > 50 ? (
              <Text style={styles.expandHint}>show more</Text>
            ) : expanded ? (
              <Text style={styles.expandHint}>show less</Text>
            ) : null}
          </TouchableOpacity>
        ) : null}
        {item.meaningGu ? <Text style={styles.guText} numberOfLines={1}>{item.meaningGu}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSpeak} hitSlop={10} style={styles.iconBtn}>
          <MaterialCommunityIcons name="volume-high" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} hitSlop={10} style={styles.iconBtn}>
          <MaterialCommunityIcons name="delete" size={22} color={colors.danger} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress} hitSlop={10} style={styles.iconBtn}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  card: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12,
    marginHorizontal: 16, marginVertical: 5, padding: 12,
    borderWidth: 0.5, borderColor: colors.border, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '700', color: colors.primary },
  center: { flex: 1, marginHorizontal: 12 },
  wordRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  wordText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  typeText: { fontSize: 12, fontStyle: 'italic', color: colors.primaryMid },
  meaningText: { fontSize: 13, color: colors.textSecondary },
  expandHint: { fontSize: 11, color: colors.primary, marginTop: 1 },
  guText: { fontSize: 12, color: colors.teal, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6 },
};
