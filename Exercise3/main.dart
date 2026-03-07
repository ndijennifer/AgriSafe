// Exercise 3: Complex Data Processing in Dart

class Person {
  final String name;
  final int age;

  Person(this.name, this.age);
}

void main() {
  final people = [
    Person("Alice", 25),
    Person("Bob", 30),
    Person("Charlie", 35),
    Person("Anna", 22),
    Person("Ben", 28),
  ];

  // Filter names starting with A or B
  final filtered = people
      .where((p) => p.name.startsWith("A") || p.name.startsWith("B"))
      .toList();

  // Extract ages
  final ages = filtered.map((p) => p.age).toList();

  // Calculate average
  final average = ages.reduce((a, b) => a + b) / ages.length;

  // Print rounded to 1 decimal
  print("Average age: ${average.toStringAsFixed(1)}");
}
