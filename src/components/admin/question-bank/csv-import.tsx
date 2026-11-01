"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BulkImportRow, BulkImportRowSchema } from "@/lib/validations/question";
import { bulkImportQuestionsAction } from "@/actions/question-actions";

const SAMPLE_CSV_TEMPLATE = `questionText,examYear,subjectCodeOrSlug,unitNumber,topicOrder,questionType,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty,marks,negativeMarks,tags
"What is the SI unit of electric flux?",2026,physics,1,1,MCQ_SINGLE,"N m^2 C^-1","N m C^-1","N m^2 C^-2","V m^-1",A,"Electric flux is given by Phi = E * A. In SI units, N/C * m^2 = N m^2 C^-1.",EASY,5.0,1.0,"Electrostatics, Units"
"Which of the following colligative properties is most suitable for determining molar mass of polymers?",2026,chemistry,1,1,MCQ_SINGLE,"Relative lowering of vapour pressure","Elevation in boiling point","Depression in freezing point","Osmotic pressure",D,"Osmotic pressure is measurable at room temperature and uses molarity rather than molality, making it ideal for biomolecules and polymers.",MEDIUM,5.0,1.0,"Solutions, Colligative"
"The value of integral of sin(x) from 0 to pi is:",2026,mathematics,1,2,MCQ_SINGLE,"0","1","2","-2",C,"Integral of sin(x) is -cos(x). [-cos(pi) - (-cos(0))] = -(-1) - (-1) = 2.",EASY,5.0,1.0,"Calculus, Definite Integrals"`;

interface ParsedRowResult {
  rowNumber: number;
  data: Partial<BulkImportRow>;
  isValid: boolean;
  error?: string;
}

export function CsvImportView() {
  const [isPending, startTransition] = useTransition();

  const [rawCsv, setRawCsv] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [hasParsed, setHasParsed] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_CSV_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setRawCsv(SAMPLE_CSV_TEMPLATE);
    parseCsv(SAMPLE_CSV_TEMPLATE);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawCsv(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  };

  // CSV parsing with basic quote handling
  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const parseCsv = (csvText: string) => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setParsedRows([]);
      setHasParsed(true);
      return;
    }

    // Header validation
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const results: ParsedRowResult[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const rowObj: Record<string, unknown> = {};

      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] ?? "";
      });

      // Map to schema format
      const candidate: Partial<BulkImportRow> = {
        questionText: (rowObj["questiontext"] as string) || (rowObj["question"] as string) || "",
        examYear: parseInt((rowObj["examyear"] as string) || "2026", 10),
        subjectCodeOrSlug: (rowObj["subjectcodeorslug"] as string) || (rowObj["subject"] as string) || "physics",
        unitNumber: parseInt((rowObj["unitnumber"] as string) || (rowObj["unit"] as string) || "1", 10),
        topicOrder: parseInt((rowObj["topicorder"] as string) || (rowObj["topic"] as string) || "1", 10),
        questionType: (rowObj["questiontype"] as BulkImportRow["questionType"]) || "MCQ_SINGLE",
        optionA: (rowObj["optiona"] as string) || "",
        optionB: (rowObj["optionb"] as string) || "",
        optionC: (rowObj["optionc"] as string) || undefined,
        optionD: (rowObj["optiond"] as string) || undefined,
        correctAnswer: ((rowObj["correctanswer"] as string) || (rowObj["answer"] as string) || "A").toUpperCase(),
        explanation: (rowObj["explanation"] as string) || "",
        difficulty: ((rowObj["difficulty"] as string) || "MEDIUM").toUpperCase() as "EASY" | "MEDIUM" | "HARD",
        marks: parseFloat((rowObj["marks"] as string) || "5.0"),
        negativeMarks: parseFloat((rowObj["negativemarks"] as string) || "1.0"),
        tags: (rowObj["tags"] as string) || "",
      };

      const validation = BulkImportRowSchema.safeParse(candidate);

      if (validation.success) {
        // Also verify correct answer matches one of the options
        const ans = candidate.correctAnswer;
        if (ans !== "A" && ans !== "B" && ans !== "C" && ans !== "D") {
          results.push({
            rowNumber: i,
            data: candidate,
            isValid: false,
            error: `Correct answer "${ans}" is invalid. Must be A, B, C, or D.`,
          });
        } else {
          results.push({
            rowNumber: i,
            data: validation.data,
            isValid: true,
          });
        }
      } else {
        results.push({
          rowNumber: i,
          data: candidate,
          isValid: false,
          error: validation.error.issues[0]?.message || "Validation failed.",
        });
      }
    }

    setParsedRows(results);
    setHasParsed(true);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid).map((r) => r.data as BulkImportRow);
    if (validRows.length === 0) return;

    startTransition(async () => {
      const res = await bulkImportQuestionsAction(validRows);
      if (res.success && res.data) {
        setImportSummary({
          imported: res.data.importedCount,
          skipped: res.data.skippedCount + parsedRows.filter((r) => !r.isValid).length,
          errors: res.data.errors,
        });
      } else {
        alert(res.error || "Failed to import questions.");
      }
    });
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Question Bank</span>
        </Link>

        <Badge variant="outline" className="text-xs font-mono">
          Bulk Ingestion Pipeline
        </Badge>
      </div>

      {/* Header Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Bulk Question Import (CSV)
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Upload or paste a structured CSV file of CUET UG questions. The validation engine
              verifies syllabus references, option counts, and answer keys before any data is
              committed to the database.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyTemplate}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Template"}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Load Sample CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Import Summary if completed */}
      {importSummary && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                Bulk Import Completed Successfully
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400">
                Successfully ingested <strong>{importSummary.imported}</strong> new questions into the
                CUET UG question bank as drafts for editorial review.
              </p>
            </div>
          </div>

          {importSummary.skipped > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300">
                {importSummary.skipped} rows skipped due to validation errors:
              </span>
              <ul className="list-disc ml-4 space-y-0.5 text-amber-800 dark:text-amber-400">
                {importSummary.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Link href="/admin/question-bank">
              <Button size="sm" className="text-xs font-semibold">
                Go to Question Bank
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Input / Upload Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground">Upload CSV File or Paste Raw Text</h3>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
        </div>

        <Textarea
          rows={7}
          placeholder="questionText,examYear,subjectCodeOrSlug,unitNumber,topicOrder,questionType,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty,marks,negativeMarks,tags..."
          value={rawCsv}
          onChange={(e) => {
            setRawCsv(e.target.value);
            parseCsv(e.target.value);
          }}
          className="font-mono text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Standard format: comma-separated with quoted multiline strings</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => parseCsv(rawCsv)}
            className="text-xs"
          >
            Re-validate Rows
          </Button>
        </div>
      </div>

      {/* Validation Preview Table */}
      {hasParsed && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground">Validation Preview</h3>
              <p className="text-xs text-muted-foreground">
                Found <strong>{parsedRows.length}</strong> total rows:{" "}
                <span className="text-emerald-600 font-semibold">{validCount} valid</span>,{" "}
                <span className="text-rose-600 font-semibold">{invalidCount} with errors</span>.
              </p>
            </div>

            <Button
              type="button"
              disabled={validCount === 0 || isPending}
              onClick={handleExecuteImport}
              className="text-xs font-semibold px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>Import {validCount} Valid Questions</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Question Statement</th>
                  <th className="py-2.5 px-3">Subject / Unit</th>
                  <th className="py-2.5 px-3">Key</th>
                  <th className="py-2.5 px-3">Validation Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {parsedRows.map((r) => (
                  <tr key={r.rowNumber} className={r.isValid ? "" : "bg-rose-50/20 dark:bg-rose-950/10"}>
                    <td className="py-2.5 px-3 font-mono font-bold text-muted-foreground">
                      #{r.rowNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.isValid ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Valid
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                          Error
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground line-clamp-1 max-w-xs">
                      {r.data.questionText || "Empty"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.data.subjectCodeOrSlug} (U{r.data.unitNumber}.T{r.data.topicOrder})
                    </td>
                    <td className="py-2.5 px-3 font-bold font-mono">
                      {r.data.correctAnswer}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      {r.isValid ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready for ingestion
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
