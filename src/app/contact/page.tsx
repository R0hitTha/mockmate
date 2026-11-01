"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/layout/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/feedback/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    // Simulate safe demonstration response
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="Contact MockMate Support"
            description="Have questions regarding our CUET UG preparation platform, subject coverage, or feedback? Send us a message."
            badge={<Badge variant="default">Student Support</Badge>}
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="default">
          <div className="max-w-xl mx-auto space-y-8">
            {/* Transparent Demo Notice */}
            <Alert variant="info" title="Demonstration Notice">
              MockMate is in active phased development. Form submissions are currently
              logged as demonstrations. Direct transactional email integrations will be
              configured in subsequent launch phases.
            </Alert>

            {submitted ? (
              <Card className="text-center p-8 sm:p-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Message Recorded (Demo State)
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Thank you, <span className="font-semibold text-foreground">{name}</span>
                  . Your message regarding &ldquo;{category}&rdquo; was validated and
                  captured in our demonstration log.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setMessage("");
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <Alert variant="destructive" title="Validation Error">
                        {error}
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="contact-name" required>
                        Your Full Name
                      </Label>
                      <Input
                        id="contact-name"
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email" required>
                        Email Address
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="e.g. priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-category">Inquiry Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="contact-category">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiries</SelectItem>
                          <SelectItem value="cuet-prep">
                            CUET UG Subjects & Syllabus
                          </SelectItem>
                          <SelectItem value="mocks">
                            Mock Test Interface Feedback
                          </SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-msg" required>
                        Your Message
                      </Label>
                      <Textarea
                        id="contact-msg"
                        placeholder="Describe your inquiry, subject question, or feedback..."
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" isLoading={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
