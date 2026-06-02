import { useState } from "react";
import { apiFetch } from "../../services/api";

type FormState = { name: string; email: string; subject: string; message: string };
type Status = "idle" | "sending" | "success" | "error";

const empty = (): FormState => ({ name: "", email: "", subject: "", message: "" });

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(empty());
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Something went wrong.");
      }

      setStatus("success");
      setForm(empty());
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col">
      <title>Contact Us | Qaoni</title>
      <meta name="description" content="Get in touch with the Qaoni team. Have a question, suggestion, or want to list your business? We'd love to hear from you." />

      {/* Hero */}
      <section className="bg-brand-primary text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in touch</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Have a question, a suggestion, or want to list your business on Qaoni? We'd love to hear from you.
        </p>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">We're here to help</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you're a business owner with questions about setting up your shop, a shopper looking
              for help, or someone with a great idea — send us a message and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0 text-lg">✉️</div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:sarah@qaoni.ca" className="text-brand-secondary hover:underline">sarah@qaoni.ca</a>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0 text-lg">⏱️</div>
                <div>
                  <p className="font-semibold text-gray-900">Response time</p>
                  <p className="text-gray-600 text-sm">We typically respond within 1–2 business days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-600 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm text-brand-secondary hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Your name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="What's this about?"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-brand-primary text-white py-3 rounded-lg font-medium hover:bg-brand-secondary transition disabled:opacity-60 cursor-pointer"
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
