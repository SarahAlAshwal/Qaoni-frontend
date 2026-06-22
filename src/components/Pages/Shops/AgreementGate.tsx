import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";

interface Props {
  children: React.ReactNode;
}

type Status = "loading" | "required" | "accepted";

export default function AgreementGate({ children }: Props) {
  const { user, getAccessTokenSilently, logout } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiFetch("/api/owner-agreement", { method: "GET" }, getAccessTokenSilently);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStatus(data.accepted ? "accepted" : "required");
      } catch {
        setStatus("required");
      }
    };
    void check();
  }, [getAccessTokenSilently]);

  const handleAccept = async () => {
    if (!checked) return;
    try {
      setIsSubmitting(true);
      const res = await apiFetch("/api/owner-agreement", { method: "POST" }, getAccessTokenSilently);
      if (!res.ok) throw new Error();
      setStatus("accepted");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">Loading...</div>;
  }

  if (!user?.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">✉️</div>
          <h2 className="text-xl font-semibold text-gray-900">Verify your email first</h2>
          <p className="text-gray-500 text-sm">
            We sent a verification link to <span className="font-medium text-gray-700">{user?.email}</span>.
            Click the link in that email, then log back in to access your business space.
          </p>
          <button
            onClick={() => logout()}
            className="mt-4 inline-block bg-brand-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-secondary transition cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  if (status === "accepted") {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Business Owner Agreement</h1>
          <p className="text-gray-500 text-sm">Please read and accept the following terms before using your business space.</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5 text-sm text-gray-700 leading-relaxed max-h-[55vh] overflow-y-auto">

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">1. Accuracy of Information</h2>
            <p>You are solely responsible for ensuring that all information published on your business page — including name, description, contact details, location, images, and product listings — is accurate, up to date, and not misleading to customers.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">2. Content Responsibility</h2>
            <p>You take full responsibility for all content you upload or publish through Qaoni, including images, descriptions, and any other materials. You confirm that you own or have the legal right to use all images, logos, and other media you upload. Content must not infringe on any third-party intellectual property rights, and must not be offensive, harmful, or illegal.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">3. Legal Compliance</h2>
            <p>You confirm that your business operates in compliance with all applicable local, provincial, and federal laws and regulations. Qaoni bears no responsibility for any legal violations arising from your business activities or the content you publish.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">4. Prohibited Content</h2>
            <p>You must not use Qaoni to advertise or sell illegal products or services, promote harmful or discriminatory content, or engage in any activity that could damage the reputation of Qaoni or other users of the platform.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">5. Qaoni's Right to Remove Content</h2>
            <p>Qaoni reserves the right to unpublish or remove any business page or content that violates these terms, without prior notice. Repeated violations may result in permanent removal from the platform.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">6. No Endorsement</h2>
            <p>Listing your business on Qaoni does not constitute an endorsement by Qaoni of your products, services, or business practices. Qaoni acts solely as a directory platform.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-semibold text-gray-900">7. Limitation of Liability</h2>
            <p>Qaoni is not liable for any losses, damages, or disputes arising from your use of the platform or from transactions between you and customers. You agree to indemnify Qaoni against any claims arising from your content or business conduct.</p>
          </section>

        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 w-4 h-4 accent-brand-primary cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              I have read and understood the Business Owner Agreement, and I accept full responsibility for the content and conduct of my business on Qaoni.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={() => void handleAccept()}
            disabled={!checked || isSubmitting}
            className="w-full bg-brand-primary text-white py-3 rounded-xl font-medium hover:bg-brand-secondary transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Accept & Continue"}
          </button>
        </div>

      </div>
    </div>
  );
}
