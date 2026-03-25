import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A": return Colors.success;
    case "B": return Colors.blue;
    case "C": return Colors.warning;
    case "D": return "#F59E0B";
    default: return Colors.primary;
  }
}

type GradeBarProps = {
  name: string;
  average: number;
  letterGrade: string;
  passed: boolean;
  maxScore?: number;
  index?: number;
};

export function GradeBar({
  name,
  average,
  letterGrade,
  passed,
  maxScore = 100,
  index = 0,
}: GradeBarProps) {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((average / maxScore) * 100, 100);
  const color = getGradeColor(letterGrade);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: percentage,
      duration: 500 + index * 40,
      delay: index * 30,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.row}>
      <View style={styles.nameWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.barWrap}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: color,
                width: animWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.score, { color }]}>{average}%</Text>
        <View style={[styles.gradeBadge, { backgroundColor: color + "18" }]}>
          <Text style={[styles.gradeLetter, { color }]}>{letterGrade}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  nameWrap: {
    width: 100,
  },
  name: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.navy,
  },
  barWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  score: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    width: 42,
    textAlign: "right",
  },
  gradeBadge: {
    width: 28,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
