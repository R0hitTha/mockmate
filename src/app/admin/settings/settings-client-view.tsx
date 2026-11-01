"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { updatePlatformSettingAction } from "@/actions/admin-actions";

interface SettingItem {
  key: string;
  value: string;
  category: string;
  description?: string;
}

interface SettingsClientViewProps {
  initialSettings: SettingItem[];
}

export function SettingsClientView({ initialSettings }: SettingsClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of initialSettings) {
      map[s.key] = s.value;
    }
    return map;
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = (item: SettingItem) => {
    const val = settings[item.key];
    startTransition(async () => {
      const res = await updatePlatformSettingAction({
        key: item.key,
        value: val,
        category: item.category as "GENERAL" | "EXAM" | "ACCESS" | "MONETIZATION" | "AI",
        description: item.description,
      });

      if (res.success) {
        toast.success(`Updated ${item.key}`);
        router.refresh();
      } else {
        toast.error(res.error || `Failed to update ${item.key}`);
      }
    });
  };

  const categories = ["GENERAL", "EXAM", "ACCESS", "MONETIZATION", "AI"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Global Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust core system configuration, exam season parameters, and feature accessibility flags.
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const items = initialSettings.filter((s) => s.category === category);
          if (items.length === 0) return null;

          return (
            <Card key={category} className="border-border shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-primary">
                      {category} Settings
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Operational parameters for {category.toLowerCase()} workflows.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {items.length} keys
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="max-w-md">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {item.key}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.description || "System configuration variable"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {item.value === "true" || item.value === "false" ? (
                        <select
                          value={settings[item.key] ?? item.value}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          className="h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                        >
                          <option value="true">Enabled (true)</option>
                          <option value="false">Disabled (false)</option>
                        </select>
                      ) : (
                        <Input
                          value={settings[item.key] ?? item.value}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          className="h-8 text-xs w-full sm:w-64"
                        />
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleSaveSetting(item)}
                        disabled={isPending || settings[item.key] === item.value}
                      >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
