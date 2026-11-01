import type { TestResultData, ResultFilterParams } from "./validations/evaluation";

export class ResultMemoryStore {
  private results = new Map<string, TestResultData>();
  private attemptToResultMap = new Map<string, string>();

  saveResult(result: TestResultData): void {
    this.results.set(result.id, { ...result });
    this.attemptToResultMap.set(result.attemptId, result.id);
  }

  getResultById(id: string): TestResultData | null {
    const res = this.results.get(id);
    return res ? JSON.parse(JSON.stringify(res)) : null;
  }

  getResultByAttemptId(attemptId: string): TestResultData | null {
    const resultId = this.attemptToResultMap.get(attemptId);
    if (!resultId) return null;
    return this.getResultById(resultId);
  }

  getStudentResults(
    studentId: string,
    params: ResultFilterParams = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" }
  ): { results: TestResultData[]; total: number; page: number; totalPages: number } {
    let items = Array.from(this.results.values()).filter(
      (r) => r.studentId === studentId
    );

    // Filter by search
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.testTitle.toLowerCase().includes(q) ||
          r.testCode.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (params.category && params.category !== "ALL") {
      items = items.filter((r) => r.testCategory === params.category);
    }

    // Filter by examYear
    if (params.examYear && params.examYear !== "ALL") {
      const year = parseInt(params.examYear, 10);
      items = items.filter((r) => r.examYear === year);
    }

    // Filter by status
    if (params.status) {
      items = items.filter((r) => r.status === params.status);
    }

    // Sorting
    const sortOrderFactor = params.sortOrder === "asc" ? 1 : -1;
    items.sort((a, b) => {
      switch (params.sortBy) {
        case "marks":
          return (a.totalMarks - b.totalMarks) * sortOrderFactor;
        case "percentage":
          return (a.percentage - b.percentage) * sortOrderFactor;
        case "accuracy":
          return (a.accuracy - b.accuracy) * sortOrderFactor;
        case "date":
        default:
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
            sortOrderFactor
          );
      }
    });

    const total = items.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return {
      results: paginated.map((r) => JSON.parse(JSON.stringify(r))),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getAllResults(
    params: ResultFilterParams = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" }
  ): { results: TestResultData[]; total: number; page: number; totalPages: number } {
    let items = Array.from(this.results.values());

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.testTitle.toLowerCase().includes(q) ||
          r.testCode.toLowerCase().includes(q) ||
          (r.studentName && r.studentName.toLowerCase().includes(q)) ||
          (r.studentEmail && r.studentEmail.toLowerCase().includes(q))
      );
    }

    if (params.status) {
      items = items.filter((r) => r.status === params.status);
    }

    if (params.examYear && params.examYear !== "ALL") {
      const year = parseInt(params.examYear, 10);
      items = items.filter((r) => r.examYear === year);
    }

    const sortOrderFactor = params.sortOrder === "asc" ? 1 : -1;
    items.sort((a, b) => {
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        sortOrderFactor
      );
    });

    const total = items.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return {
      results: paginated.map((r) => JSON.parse(JSON.stringify(r))),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  clear(): void {
    this.results.clear();
    this.attemptToResultMap.clear();
  }
}

export const resultMemoryStore = new ResultMemoryStore();
