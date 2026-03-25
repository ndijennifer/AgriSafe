import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type StudentGrade = {
  id: string;
  name: string;
  scores: Record<string, number>;
  total: number;
  average: number;
  letterGrade: string;
  passed: boolean;
};

export type GradeSheet = {
  id: string;
  title: string;
  createdAt: string;
  columns: string[];
  students: StudentGrade[];
  maxScore: number;
  passingScore: number;
  stats: {
    classAverage: number;
    highest: number;
    lowest: number;
    passRate: number;
  };
};

type GradeContextType = {
  sheets: GradeSheet[];
  activeSheet: GradeSheet | null;
  setActiveSheet: (sheet: GradeSheet | null) => void;
  addSheet: (sheet: GradeSheet) => void;
  deleteSheet: (id: string) => void;
  updateSheet: (sheet: GradeSheet) => void;
  isLoading: boolean;
};

const GradeContext = createContext<GradeContextType | null>(null);

const STORAGE_KEY = "grade_calculator_sheets";

export function calculateLetterGrade(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [sheets, setSheets] = useState<GradeSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<GradeSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setSheets(JSON.parse(data));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const saveSheets = async (updatedSheets: GradeSheet[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSheets));
    } catch {}
  };

  const addSheet = useCallback(
    (sheet: GradeSheet) => {
      const updated = [sheet, ...sheets];
      setSheets(updated);
      saveSheets(updated);
    },
    [sheets]
  );

  const deleteSheet = useCallback(
    (id: string) => {
      const updated = sheets.filter((s) => s.id !== id);
      setSheets(updated);
      saveSheets(updated);
      if (activeSheet?.id === id) setActiveSheet(null);
    },
    [sheets, activeSheet]
  );

  const updateSheet = useCallback(
    (sheet: GradeSheet) => {
      const updated = sheets.map((s) => (s.id === sheet.id ? sheet : s));
      setSheets(updated);
      saveSheets(updated);
      if (activeSheet?.id === sheet.id) setActiveSheet(sheet);
    },
    [sheets, activeSheet]
  );

  return (
    <GradeContext.Provider
      value={{
        sheets,
        activeSheet,
        setActiveSheet,
        addSheet,
        deleteSheet,
        updateSheet,
        isLoading,
      }}
    >
      {children}
    </GradeContext.Provider>
  );
}

export function useGrades() {
  const ctx = useContext(GradeContext);
  if (!ctx) throw new Error("useGrades must be used within GradeProvider");
  return ctx;
}
