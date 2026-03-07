// Exercise 2: Transforming Between Collection Types in Dart

void main() {
  final words = ["apple", "cat", "banana", "dog", "elephant"];

  // Create a map where keys = word, values = length
  final wordLengths = {for (var w in words) w: w.length};

  // Filter entries with length > 4 and print
  wordLengths.entries
      .where((entry) => entry.value > 4)
      .forEach((entry) => print("${entry.key} has length ${entry.value}"));
}
