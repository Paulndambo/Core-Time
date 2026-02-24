import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-tertiary)] py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                <Link to="/login" className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:underline mb-6">
                    <ArrowLeft size={20} />
                    Back to Login
                </Link>

                <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Terms of Service</h1>
                <p className="text-sm text-[var(--color-text-muted)] mb-8">Last Updated: February 12, 2026</p>

                <div className="space-y-6 text-[var(--color-text-secondary)]">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Coretime ("the App"), you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to these Terms of Service, please do not use the App.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">2. Description of Service</h2>
                        <p>
                            Coretime is a personal tracker application that allows you to manage your finances, household chores, personal notes,
                            habits, goals, and calendar events. The App integrates with Google services to provide authentication and calendar synchronization features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">3. User Accounts</h2>
                        <p className="mb-2">
                            To use Coretime, you must sign in using your Google account. By doing so, you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">4. Google Services Integration</h2>
                        <p>
                            Coretime uses Google OAuth for authentication and may access your Google Calendar with your explicit permission.
                            Your use of Google services through Routinely is also subject to Google's Terms of Service and Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">5. User Data and Content</h2>
                        <p className="mb-2">
                            You retain all rights to the data and content you create in Routinely, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Financial transaction records</li>
                            <li>Chore lists and assignments</li>
                            <li>Personal notes</li>
                            <li>Calendar events</li>
                        </ul>
                        <p className="mt-2">
                            You are responsible for maintaining backups of your data. We are not liable for any loss of data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">6. Acceptable Use</h2>
                        <p className="mb-2">You agree not to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Use the App for any illegal purposes</li>
                            <li>Attempt to gain unauthorized access to the App or its systems</li>
                            <li>Interfere with or disrupt the App's functionality</li>
                            <li>Use the App to transmit malicious code or harmful content</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">7. Disclaimer of Warranties</h2>
                        <p>
                            Routinely is provided "as is" and "as available" without warranties of any kind, either express or implied.
                            We do not guarantee that the App will be uninterrupted, secure, or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
                            or any loss of data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes
                            by updating the "Last Updated" date. Your continued use of the App after such changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">10. Termination</h2>
                        <p>
                            You may stop using the App at any time. We reserve the right to suspend or terminate your access to the App
                            at our discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">11. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us through the App's support channels.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200">
                    <p className="text-sm text-[var(--color-text-muted)] text-center">
                        By using Routinely, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
