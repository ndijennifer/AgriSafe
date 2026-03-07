// Exercise 4: Custom Higher-Order Function in Dart

List<int> processList(List<int> numbers, bool Function(int) predicate) {
  return numbers.where(predicate).toList();
}

void main() {
  final nums = [1, 2, 3, 4, 5, 6];

  // Example: filter even numbers
  final even = processList(nums, (n) => n % 2 == 0);
  print("Even numbers: $even"); // [2, 4, 6]

  // Example: filter numbers greater than 3
  final greaterThanThree = processList(nums, (n) => n > 3);
  print("Numbers > 3: $greaterThanThree"); // [4, 5, 6]
}
