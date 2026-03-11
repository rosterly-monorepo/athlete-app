import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Rosterly",
  description: "Learn how Rosterly collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: March 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p>
          This Privacy Policy explains how Rosterly (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects and uses
          personal information through our services and websites. Personal information means
          information about an identifiable individual.
        </p>

        <p>
          This Privacy Policy applies globally, but we have included additional information
          below for residents of the European Economic Area, the United Kingdom, Switzerland,
          and California.
        </p>

        <p>
          This Privacy Policy does not apply to de-identified or anonymous information.
        </p>

        <Section title="1. What information do we collect and why?">
          <Subsection title="When you create an account as an athlete">
            <p>
              We collect your name, email address, school, graduation year, sport, position,
              height, weight, bio, and performance statistics. We collect this to build your
              athlete profile and share it with prospective university recruiters.
            </p>
          </Subsection>

          <Subsection title="When you create an account as a coach">
            <p>
              We collect your name, email address, and organization affiliation. We verify your
              association with an accredited university before granting access to athlete profiles.
            </p>
          </Subsection>

          <Subsection title="When you use our platform">
            <p>
              We collect information about how you use our services, including pages visited,
              features used, and actions taken. We use this to improve our platform and provide
              a better experience.
            </p>
          </Subsection>

          <Subsection title="Authentication">
            <p>
              We use Clerk, a third-party authentication provider, to manage sign-in and account
              security. Clerk may collect additional information as described in their privacy policy.
            </p>
          </Subsection>
        </Section>

        <Section title="2. When and why do we share personal information?">
          <p>We share your information in the following circumstances:</p>

          <Subsection title="Athlete profiles">
            <p>
              If you are an athlete and enable profile visibility, your profile information is
              shared with verified coaches at accredited universities who have onboarded to our
              platform. Your profile is <strong>not</strong> publicly accessible on the internet.
            </p>
          </Subsection>

          <Subsection title="Service providers">
            <p>
              We share information with third-party service providers who perform functions on
              our behalf, such as hosting, authentication, and analytics.
            </p>
          </Subsection>

          <Subsection title="Legal requirements">
            <p>
              We may share information with regulators, authorities, and enforcement agencies
              where we are under a legal duty to disclose your personal data or to protect our
              rights, property, and safety.
            </p>
          </Subsection>

          <Subsection title="Business transfers">
            <p>
              We may share information in connection with a merger, acquisition, or sale of
              assets, in which case your information may be transferred to the acquiring entity.
            </p>
          </Subsection>
        </Section>

        <Section title="3. How do we keep your personal information secure?">
          <p>
            We implement administrative, technical, and physical security measures to protect
            your information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> Data encrypted in transit and at rest</li>
            <li><strong>Access control:</strong> Authentication and least-privilege access</li>
            <li><strong>Protected servers:</strong> Data stored on servers not publicly accessible</li>
            <li><strong>Audit logging:</strong> All data changes are logged for accountability</li>
          </ul>
          <p>
            No data storage or transmission is without risk. We cannot guarantee absolute security,
            but we take reasonable measures to protect your information.
          </p>
        </Section>

        <Section title="4. Where do we store your personal information?">
          <p>
            Rosterly stores your data in the United States. Some of our service providers may
            be based outside of your jurisdiction. When we transfer your personal information,
            we ensure it receives appropriate protection as required by law.
          </p>
        </Section>

        <Section title="5. How long do we keep your personal information?">
          <p>
            We keep your information as long as your account is active or as needed to provide
            services. After account deletion, we may retain certain information as required by
            law or for legitimate business purposes. We may use anonymized information
            indefinitely to improve our services.
          </p>
        </Section>

        <Section title="6. What are my rights?">
          <Subsection title="Access and correction">
            <p>
              You can access and update your profile information through your account settings.
              To request a copy of all personal information we hold about you, contact us.
            </p>
          </Subsection>

          <Subsection title="Deletion">
            <p>
              You can request deletion of your account and associated data by contacting us.
              Some information may be retained as required by law.
            </p>
          </Subsection>

          <Subsection title="Profile visibility">
            <p>
              You control whether your profile is visible to university recruiters through your
              account settings. You can disable visibility at any time.
            </p>
          </Subsection>
        </Section>

        <Section title="7. Additional rights for European residents">
          <p>
            In addition to the rights above, European residents may also be entitled to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Restrict processing:</strong> Request that we limit or cease processing your information</li>
            <li><strong>Portability:</strong> Request transfer of your information to another organization</li>
            <li><strong>Object:</strong> Object to how we are using your personal information</li>
            <li><strong>Withdraw consent:</strong> Withdraw consent to our handling of your personal information</li>
          </ul>
        </Section>

        <Section title="8. Additional rights for California residents">
          <p>
            If you are a California resident, you can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request what personal information we have about you</li>
            <li>Request deletion of your personal information</li>
            <li>Request that we stop selling your personal information (we do not sell personal information)</li>
          </ul>
        </Section>

        <Section title="9. Third-party links">
          <p>
            Our platform may contain links to other websites that we do not operate. We have no
            control over such websites and no responsibility for how they handle your information.
          </p>
        </Section>

        <Section title="10. Changes to this Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will apply to information
            collected from the date we post the revised policy. The date of the last revision is
            shown at the top of this page.
          </p>
        </Section>

        <Section title="11. Contact us">
          <p>
            If you have questions about this Privacy Policy or want to exercise your data rights,
            contact us at:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> privacy@joinrosterly.com
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
