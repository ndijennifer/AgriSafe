// Exercise 1: Student Grade Calculator in Dart

class Student {
  final String name;
  final int? score; // nullable score

  Student(this.name, this.score);
}

String getGrade(int score) {
  if (score >= 90 && score <= 100)
    return "A";
  else if (score >= 80)
    return "B";
  else if (score >= 70)
    return "C";
  else if (score >= 60)
    return "D";
  else
    return "F";
}

void printGrades(List<Student> students) {
  for (var student in students) {
    if (student.score != null) {
      final grade = getGrade(student.score!);
      print("${student.name} scored ${student.score} : Grade $grade");
    } else {
      print("No score for ${student.name}");
    }
  }
}

void main() {
  final students = [
    Student("Alice", 95),
    Student("Bob", 82),
    Student("Charlie", null),
    Student("Diana", 47),
  ];

  printGrades(students);
}
