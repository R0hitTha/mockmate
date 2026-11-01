"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintExportButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="text-xs flex items-center gap-1.5 font-medium shadow-2xs"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save PDF</span>
    </Button>
  );
}

