import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Exercise 1: Basic grade calculation logic ────────────────────────────────

export function calculateAverage(ca: number, exam: number): number {
  return Math.round(((ca + exam) / 2) * 10) / 10;
}

export function determineGrade(average: number): string {
  if (average >= 70) return "A";
  if (average >= 60) return "B";
  if (average >= 50) return "C";
  if (average >= 40) return "D";
  return "F";
}

export function getGradeRemarks(grade: string): string {
  switch (grade) {
    case "A": return "Distinction";
    case "B": return "Merit";
    case "C": return "Pass";
    case "D": return "Marginal Pass";
    default:  return "Fail";
  }
}

export function isPassing(grade: string): boolean {
  return grade !== "F";
}

// ─── Exercise 2: Lambda / higher-order functions ──────────────────────────────

export function computeCourseAverages(courses: Course[]): number[] {
  return courses.map((c) => calculateAverage(c.ca, c.exam));
}

export function findBestCourse(courses: Course[]): Course | null {
  if (courses.length === 0) return null;
  return courses.reduce((best, c) =>
    calculateAverage(c.ca, c.exam) > calculateAverage(best.ca, best.exam) ? c : best
  );
}

export function findWorstCourse(courses: Course[]): Course | null {
  if (courses.length === 0) return null;
  return courses.reduce((worst, c) =>
    calculateAverage(c.ca, c.exam) < calculateAverage(worst.ca, worst.exam) ? c : worst
  );
}

export function computeOverallAverage(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const total = courses.reduce(
    (sum, c) => sum + calculateAverage(c.ca, c.exam),
    0
  );
  return Math.round((total / courses.length) * 10) / 10;
}

export function filterPassingCourses(courses: Course[]): Course[] {
  return courses.filter((c) => isPassing(determineGrade(calculateAverage(c.ca, c.exam))));
}

export function filterFailingCourses(courses: Course[]): Course[] {
  return courses.filter((c) => !isPassing(determineGrade(calculateAverage(c.ca, c.exam))));
}

// ─── Exercise 3: OOP — interface + implementing class ────────────────────────

export interface IGradeCalculator {
  calculateAverage(ca: number, exam: number): number;
  determineGrade(average: number): string;
  getRemarks(grade: string): string;
  isPassing(grade: string): boolean;
}

export class GradeCalculator implements IGradeCalculator {
  calculateAverage(ca: number, exam: number): number {
    return calculateAverage(ca, exam);
  }
  determineGrade(average: number): string {
    return determineGrade(average);
  }
  getRemarks(grade: string): string {
    return getGradeRemarks(grade);
  }
  isPassing(grade: string): boolean {
    return isPassing(grade);
  }
  computeResult(ca: number, exam: number): CourseResult {
    const average = this.calculateAverage(ca, exam);
    const grade = this.determineGrade(average);
    return {
      average,
      grade,
      remarks: this.getRemarks(grade),
      passed: this.isPassing(grade),
    };
  }
}

// ─── Data types ───────────────────────────────────────────────────────────────

export type Course = {
  id: string;
  name: string;
  ca: number;
  exam: number;
};

export type CourseResult = {
  average: number;
  grade: string;
  remarks: string;
  passed: boolean;
};

export type StudentRecord = {
  id: string;
  studentName: string;
  studentId: string;
  createdAt: string;
  courses: Course[];
};

// ─── Context ──────────────────────────────────────────────────────────────────

type GradeContextType = {
  records: StudentRecord[];
  activeRecord: StudentRecord | null;
  setActiveRecord: (r: StudentRecord | null) => void;
  addRecord: (r: StudentRecord) => void;
  updateRecord: (r: StudentRecord) => void;
  deleteRecord: (id: string) => void;
  isLoading: boolean;
  calculator: GradeCalculator;
};

const GradeContext = createContext<GradeContextType | null>(null);

const STORAGE_KEY = "grade_calc_records_v2";

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const calculator = new GradeCalculator();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => { if (data) setRecords(JSON.parse(data)); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const save = (updated: StudentRecord[]) => {
    setRecords(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const addRecord = useCallback((r: StudentRecord) => {
    setRecords((prev) => { const next = [r, ...prev]; AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
  }, []);

  const updateRecord = useCallback((r: StudentRecord) => {
    setRecords((prev) => {
      const next = prev.map((x) => (x.id === r.id ? r : x));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (activeRecord?.id === r.id) setActiveRecord(r);
      return next;
    });
  }, [activeRecord]);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => {
      const next = prev.filter((x) => x.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (activeRecord?.id === id) setActiveRecord(null);
      return next;
    });
  }, [activeRecord]);

  return (
    <GradeContext.Provider value={{ records, activeRecord, setActiveRecord, addRecord, updateRecord, deleteRecord, isLoading, calculator }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGrades() {
  const ctx = useContext(GradeContext);
  if (!ctx) throw new Error("useGrades must be used within GradeProvider");
  return ctx;
}
