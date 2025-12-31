import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { emailService } from "@/services/EmailService";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // For now, use the EmailService to send to support
      // In production, this would typically go through a backend API
      const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@shopmatic.cc";
      
      // Create HTML email content
      const htmlContent = `
        <h2>Contact Form Submission</h2>
        <p><strong>From:</strong> ${formData.name} (${formData.email})</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, "<br>")}</p>
      `;

      const textContent = `
Contact Form Submission
From: ${formData.name} (${formData.email})

Message:
${formData.message}
      `;

      // Send email using EmailService
      // Note: This is a client-side implementation. In production, this should go through a backend API
      // to avoid exposing email service credentials
      const result = await emailService.sendEmail({
        to: { email: supportEmail, name: "Support Team" },
        subject: `Contact Form: Message from ${formData.name}`,
        html: htmlContent,
        text: textContent,
        replyTo: formData.email,
      });

      if (result.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send contact form:", error);
      toast.error("Failed to send message. Please try again or email us directly at support@shopmatic.cc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Send us a Message</CardTitle>
        <CardDescription className="text-center">
          Fill out the form below and we'll get back to you as soon as possible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="How can we help you?"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

