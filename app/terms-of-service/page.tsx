"use client";

import Navigation from "../components/Navigation";

export default function TermsOfService() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using JoanTee (&quot;the Service&quot;), you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-300 leading-relaxed">
                JoanTee is an online clothing store that provides premium
                clothing with fast delivery service. We offer a platform for
                customers to browse, purchase, and receive clothing items
                through our website and delivery network.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-300 leading-relaxed">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. You are
                responsible for safeguarding the password and for all activities
                that occur under your account.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                You may sign in using your Google account. By doing so, you
                authorize us to access your basic profile information (name and
                email) from your Google account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Orders and Payment
              </h2>
              <p className="text-gray-300 leading-relaxed">
                All orders are subject to acceptance and availability. We
                reserve the right to refuse or cancel your order at any time for
                certain reasons including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Product or service availability</li>
                <li>Errors in product description or pricing</li>
                <li>
                  Problems identified by our credit and fraud avoidance
                  department
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Payment is required at the time of order placement. We accept
                various payment methods as displayed on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Shipping and Delivery
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We offer various delivery options including home delivery and
                pickup locations. Delivery times and costs are displayed at
                checkout. We are not responsible for delays caused by shipping
                carriers or circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Returns and Refunds
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We want you to be completely satisfied with your purchase. If
                you are not satisfied, you may return items within 30 days of
                delivery. Items must be in original condition with tags
                attached. Refunds will be processed to the original payment
                method.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Prohibited Uses
              </h2>
              <p className="text-gray-300 leading-relaxed">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>
                  For any unlawful purpose or to solicit others to perform
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-gray-300 leading-relaxed">
                The service and its original content, features, and
                functionality are and will remain the exclusive property of
                JoanTee and its licensors. The service is protected by
                copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed">
                In no event shall JoanTee, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. Termination
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account immediately, without
                prior notice or liability, for any reason whatsoever, including
                without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. Changes to Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days notice prior to any new
                terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of
                Ghana, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please
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
