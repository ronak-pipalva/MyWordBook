import React from 'react';
import { View, Text } from 'react-native';

export default function SectionBox({ label, text, bgColor, textColor, labelColor, italic }) {
  if (!text) return null;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: labelColor || '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: bgColor, borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 14, color: textColor, lineHeight: 22, fontStyle: italic ? 'italic' : 'normal' }}>
          {text}
        </Text>
      </View>
    </View>
  );
}
