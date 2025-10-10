"use client";

import Navigation from "../components/Navigation";

export default function PrivacyPolicy() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We collect information you provide directly to us, such as when
                you create an account, place an order, or contact us for
                support. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>
                  Name and contact information (email address, phone number)
                </li>
                <li>Shipping and billing addresses</li>
                <li>
                  Payment information (processed securely through our payment
                  partners)
                </li>
                <li>Account credentials when you create an account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Improve our products and services</li>
                <li>
                  Communicate with you about promotions and new products (with
                  your consent)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Google OAuth
              </h2>
              <p className="text-gray-300 leading-relaxed">
                When you sign in with Google, we collect your name and email
                address from your Google account. We use this information to
                create and manage your account on our platform. We do not access
                or store any other information from your Google account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Information Sharing
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except as described in this
                policy. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Payment processors to complete transactions</li>
                <li>Shipping carriers to deliver your orders</li>
                <li>
                  Service providers who assist us in operating our website
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-300 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and personal information</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar technologies to enhance your
                experience on our website, remember your preferences, and
                analyze how you use our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this privacy policy, please
                contact us at:
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                Email: joanteebusiness@gmail.com
                <br />
                Website: https://joantee.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
