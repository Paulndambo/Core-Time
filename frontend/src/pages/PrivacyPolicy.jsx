import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-tertiary)] py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                <Link to="/login" className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:underline mb-6">
                    <ArrowLeft size={20} />
                    Back to Login
                </Link>

                <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Privacy Policy</h1>
                <p className="text-sm text-[var(--color-text-muted)] mb-8">Last Updated: February 12, 2026</p>

                <div className="space-y-6 text-[var(--color-text-secondary)]">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Coretime ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">2.1 Information from Google</h3>
                        <p className="mb-2">When you sign in with Google, we collect:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Your name</li>
                            <li>Your email address</li>
                            <li>Your profile picture</li>
                            <li>A unique Google user identifier</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">2.2 Google Calendar Data</h3>
                        <p className="mb-2">With your explicit permission, we access:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Your Google Calendar events</li>
                            <li>Event details (title, date, time, description)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">2.3 User-Generated Content</h3>
                        <p className="mb-2">Information you create within the app:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Financial transactions and records</li>
                            <li>Chore lists and assignments</li>
                            <li>Personal notes</li>
                            <li>Calendar events created in the app</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">2.4 Technical Information</h3>
                        <p className="mb-2">We may automatically collect:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Browser type and version</li>
                            <li>Device information</li>
                            <li>IP address</li>
                            <li>Usage data and analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">3. How We Use Your Information</h2>
                        <p className="mb-2">We use the collected information to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Provide and maintain the App's functionality</li>
                            <li>Authenticate your identity</li>
                            <li>Sync your calendar events with Google Calendar</li>
                            <li>Store and display your personal data (finances, chores, notes)</li>
                            <li>Improve and optimize the App's performance</li>
                            <li>Respond to your requests and provide customer support</li>
                            <li>Detect and prevent technical issues or security threats</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">4. Data Storage and Security</h2>
                        <p className="mb-2">
                            Your data is stored locally in your browser using localStorage. We implement reasonable security measures to protect your information, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Secure HTTPS connections</li>
                            <li>OAuth 2.0 authentication with Google</li>
                            <li>Encrypted data transmission</li>
                            <li>Regular security updates</li>
                        </ul>
                        <p className="mt-2">
                            However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">5. Data Sharing and Disclosure</h2>
                        <p className="mb-2">
                            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>With Google:</strong> When you use Google Calendar integration, we share event data with Google's services</li>
                            <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
                            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">6. Google API Services User Data Policy</h2>
                        <p>
                            Routinely's use and transfer of information received from Google APIs adheres to the{' '}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-accent)] hover:underline">
                                Google API Services User Data Policy
                            </a>, including the Limited Use requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">7. Your Privacy Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct your information</li>
                            <li><strong>Deletion:</strong> Request deletion of your data by logging out and clearing browser data</li>
                            <li><strong>Revoke Access:</strong> Disconnect Google Calendar integration at any time</li>
                            <li><strong>Data Portability:</strong> Export your data from the app</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">8. Data Retention</h2>
                        <p>
                            Your data is stored locally in your browser and persists until you manually clear it or log out.
                            Google Calendar data is retained according to Google's data retention policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">9. Children's Privacy</h2>
                        <p>
                            Routinely is not intended for use by children under the age of 13. We do not knowingly collect personal information
                            from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">10. Third-Party Services</h2>
                        <p className="mb-2">
                            Routinely integrates with third-party services:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Google OAuth:</strong> For authentication (see Google's Privacy Policy)</li>
                                <li><strong>Google Calendar API &amp; Gmail API:</strong> For calendar and email synchronization (see Google's Privacy Policy)</li>
                        </ul>
                        <p className="mt-2">
                            We are not responsible for the privacy practices of these third-party services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">11. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date.
                            We encourage you to review this Privacy Policy periodically.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">12. Contact Us</h2>
                        <p>
                            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through the App's support channels.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200">
                    <p className="text-sm text-[var(--color-text-muted)] text-center">
                        By using Routinely, you acknowledge that you have read and understood this Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
