'use client'
import { useState } from 'react'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

export type LegalModalType = 'terms' | 'risk' | 'privacy' | 'welfare'

type Section = { title: string; content: string[] }
type LegalDoc = { title: string; subtitle: string; version: string; intro?: string; sections: Section[] }

const DOCS: Record<LegalModalType, LegalDoc> = {
  terms: {
    title: 'Terms of Use',
    subtitle: 'Platform Terms & Conditions',
    version: 'Version 1.0 | March 2026',
    intro: 'Hamstar is a live-streamed hamster racing entertainment platform powered by blockchain technology. These Terms of Use govern your access to the Hamstar interface, live streams, and related services. By accessing the platform, you agree to comply with these terms.',
    sections: [
      {
        title: '1. Nature of the Platform',
        content: ['Hamstar provides a digital interface that allows users to watch live hamster races and interact with on-chain smart contracts. Hamstar does not guarantee financial gain, investment returns, or profit opportunities. The platform is designed primarily for entertainment and community participation.'],
      },
      {
        title: '2. User Responsibility',
        content: [
          'Users are responsible for ensuring that participation in blockchain-based applications is legal in their jurisdiction. By using Hamstar, you confirm that:',
          '• You are at least 18 years old or the legal age of majority in your region.',
          '• You understand how blockchain transactions work, including gas fees, wallet management, and transaction finality.',
          '• You accept the risks associated with digital assets and smart contracts.',
          '• You are solely responsible for the security of your wallet and private keys.',
        ],
      },
      {
        title: '3. Smart Contract Interaction',
        content: ['Hamstar uses decentralized smart contracts to manage race pools and reward distribution. Hamstar does not custody user funds. All transactions occur directly on-chain and are executed automatically by smart contracts. Once a transaction is confirmed on the blockchain, it cannot be reversed, cancelled, or refunded.'],
      },
      {
        title: '4. No Financial Advice',
        content: ['Nothing on the Hamstar platform should be considered financial advice or investment guidance. Users participate at their own discretion and risk. Hamstar does not endorse, recommend, or advise on any financial decisions related to digital assets.'],
      },
      {
        title: '5. Platform Availability',
        content: ['Hamstar may update, modify, or suspend services at any time without prior notice in order to improve platform performance or comply with regulatory requirements. Hamstar shall not be liable for any losses resulting from temporary or permanent service interruptions.'],
      },
      {
        title: '6. Jurisdiction',
        content: ['Users are responsible for complying with the laws and regulations applicable in their jurisdiction. Hamstar may restrict access from certain regions if required by law or regulatory guidance.'],
      },
      {
        title: '7. Intellectual Property',
        content: ['All content on the Hamstar platform, including but not limited to graphics, logos, live stream footage, and interface design, is the property of Hamstar or its licensors. Users may not reproduce, distribute, or create derivative works without express permission.'],
      },
      {
        title: '8. Limitation of Liability',
        content: ['To the maximum extent permitted by law, Hamstar and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of funds, data, or digital assets.'],
      },
    ],
  },

  risk: {
    title: 'Risk Disclosure',
    subtitle: 'Risk Disclosure Statement',
    version: 'Version 1.0 | March 2026',
    intro: 'Please read this document carefully before using the Hamstar platform. By accessing or interacting with Hamstar, you acknowledge that you have read, understood, and accepted the risks described below.',
    sections: [
      {
        title: '1. No Financial Returns Guaranteed',
        content: ['Hamstar is an entertainment platform. Participation does not constitute an investment and does not guarantee any financial return. You may lose some or all of any digital assets you commit to race pools. Past outcomes have no bearing on future results.'],
      },
      {
        title: '2. Smart Contract Risk',
        content: [
          'Hamstar operates using decentralized smart contracts. These contracts are automated and execute transactions without human intervention. You acknowledge that:',
          '• Smart contracts may contain bugs, vulnerabilities, or unintended behaviors.',
          '• Once a transaction is confirmed on-chain, it is irreversible. Hamstar cannot cancel, reverse, or refund any transaction.',
          '• Interacting with smart contracts requires technical understanding. You are solely responsible for understanding the nature of each transaction before signing.',
        ],
      },
      {
        title: '3. Blockchain & Digital Asset Risk',
        content: [
          'Interacting with any blockchain-based platform involves significant risk, including but not limited to:',
          '• Volatility: The value of digital assets can be highly volatile and may decrease rapidly.',
          '• Network congestion: Blockchain networks may experience delays, high gas fees, or failures outside Hamstar\'s control.',
          '• Protocol changes: Upgrades or forks to underlying blockchain networks may affect platform functionality.',
          '• Wallet security: You are solely responsible for the security of your wallet, private keys, and seed phrases. Hamstar does not store or have access to these credentials. Loss of access to your wallet is permanent.',
        ],
      },
      {
        title: '4. Regulatory & Legal Risk',
        content: [
          'The legal status of blockchain applications, digital assets, and online entertainment varies by jurisdiction and is subject to change. You are solely responsible for:',
          '• Ensuring that your use of Hamstar complies with the laws and regulations of your jurisdiction.',
          '• Any taxes, reporting obligations, or regulatory requirements arising from your participation.',
          'Hamstar reserves the right to restrict or suspend access from any region at any time, without prior notice, in response to legal or regulatory requirements.',
        ],
      },
      {
        title: '5. Platform & Operational Risk',
        content: [
          '• Hamstar may be unavailable from time to time due to maintenance, technical issues, or circumstances beyond our control.',
          '• Platform features, rules, or smart contract parameters may be updated or deprecated.',
          '• Hamstar shall not be liable for losses arising from service interruptions, technical failures, or platform changes.',
        ],
      },
      {
        title: '6. Third-Party Risk',
        content: ['Hamstar integrates with third-party services including blockchain networks, wallet providers, and streaming infrastructure. Hamstar does not control these services and is not responsible for their availability, security, or conduct.'],
      },
      {
        title: '7. Race Outcome Risk',
        content: ['Race outcomes are determined by the natural behavior of the hamsters and are inherently unpredictable. No strategy, system, or prior performance can reliably predict race outcomes. Hamstar does not manipulate race results and cannot guarantee any specific outcome.'],
      },
      {
        title: '8. Not Financial or Legal Advice',
        content: ['Nothing on the Hamstar platform — including this document, the interface, live streams, or any associated communications — constitutes financial, investment, legal, or tax advice. You should consult qualified professionals before making decisions involving digital assets.'],
      },
      {
        title: '9. Eligibility',
        content: ['You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to use Hamstar. By using the platform, you confirm that you meet this requirement.'],
      },
      {
        title: '10. Acceptance of Risk',
        content: [
          'Use of the Hamstar platform constitutes your acknowledgment that you have read and understood this Risk Disclosure Statement and that you accept full responsibility for any risks associated with your participation.',
          'For questions or concerns, contact us at legal@hamstar.io.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Data Collection & Usage Practices',
    version: 'Version 1.0 | March 2026',
    intro: 'Hamstar is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you interact with our platform.',
    sections: [
      {
        title: '1. Information We Collect',
        content: [
          '1.1 Blockchain Data — When you interact with Hamstar smart contracts, the following on-chain data is publicly visible and recorded on the blockchain:',
          '• Your wallet address (public key)',
          '• Transaction history (race pool entries, reward distributions)',
          '• Smart contract interaction data',
          '• Token balances related to Hamstar interactions',
          'On-chain data is immutable and cannot be deleted by Hamstar or any other party. This is an inherent characteristic of blockchain technology.',
          '1.2 Platform Usage Data — When you access the Hamstar interface, we may automatically collect:',
          '• Browser type and version',
          '• Device information and operating system',
          '• IP address (anonymized for analytics)',
          '• Pages visited and interaction patterns',
          '• Session duration and timestamp',
          '1.3 Cookies — Hamstar uses essential cookies to maintain session state and platform functionality. You can manage cookie preferences through your browser settings.',
        ],
      },
      {
        title: '2. How We Use Information',
        content: [
          '• Providing and maintaining the Hamstar platform',
          '• Processing smart contract interactions',
          '• Improving platform performance and user experience',
          '• Detecting and preventing fraud or abuse',
          '• Complying with legal obligations',
          '• Communicating platform updates (if you opt in)',
        ],
      },
      {
        title: '3. Information We Do NOT Collect',
        content: [
          'Hamstar does not collect or store:',
          '• Private keys or wallet seed phrases',
          '• Personal identification documents',
          '• Email addresses (unless voluntarily provided for notifications)',
          '• Financial information beyond on-chain transaction data',
        ],
      },
      {
        title: '4. Data Sharing',
        content: ['Hamstar does not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated data for analytics purposes. We may disclose information if required by law or to protect the safety and security of the platform.'],
      },
      {
        title: '5. Data Security',
        content: ['We implement industry-standard security measures to protect platform data. However, no method of electronic transmission or storage is 100% secure. Users are responsible for securing their own wallet credentials and private keys.'],
      },
      {
        title: '6. Third-Party Services',
        content: ['Hamstar may integrate with third-party services such as blockchain networks, wallet providers, and analytics tools. These services have their own privacy policies, and we encourage you to review them. Hamstar is not responsible for the privacy practices of third-party services.'],
      },
      {
        title: '7. Live Stream Data',
        content: ['Hamstar provides live-streamed hamster races. Race footage is broadcast in real time and may be recorded for verification purposes. No personal user data is captured through the live stream. Race results are recorded on-chain for transparency.'],
      },
      {
        title: '8. Your Rights',
        content: [
          'Depending on your jurisdiction, you may have the right to:',
          '• Request access to the data we hold about you',
          '• Request correction of inaccurate data',
          '• Request deletion of off-chain data (on-chain data cannot be deleted)',
          '• Object to or restrict certain data processing',
          '• Withdraw consent for optional data collection',
        ],
      },
      {
        title: "9. Children's Privacy",
        content: ['Hamstar is not intended for use by individuals under 18 years of age or the legal age in their jurisdiction. We do not knowingly collect information from minors.'],
      },
      {
        title: '10. Changes to This Policy',
        content: ['We may update this Privacy Policy from time to time. Changes will be posted on the platform with an updated revision date. Continued use of Hamstar after changes constitutes acceptance of the updated policy.'],
      },
      {
        title: '11. Contact',
        content: ['For privacy-related inquiries, please contact us at privacy@hamstar.io.'],
      },
    ],
  },

  welfare: {
    title: 'Animal Welfare',
    subtitle: 'Hamster Care & Ethical Racing Standards',
    version: 'Version 1.0 | March 2026',
    intro: 'Hamstar is committed to the humane treatment, safety, and well-being of all animals involved in the Hamstar racing experience. The health and welfare of the hamsters always come first — before entertainment, revenue, or any other business consideration.',
    sections: [
      {
        title: '1. Welfare Principles',
        content: [
          '• Voluntary participation: Hamsters are never forced to race. If a hamster does not voluntarily enter the track or shows signs of reluctance, it is immediately returned to its habitat.',
          '• Short race duration: Each race lasts no more than 2–3 minutes, well within the natural activity window for hamsters.',
          '• Safe environment: Races are conducted in purpose-built enclosures designed with rounded edges, non-toxic materials, and appropriate temperatures (20–24°C).',
          '• Adequate rest: Each hamster participates in a maximum of 3 races per day, with a minimum 2-hour rest period between races.',
          '• Stress-free design: Racing tracks are designed to mimic natural exploration behavior. No external stimuli (noise, light flashes, etc.) are used to force movement.',
          '• Veterinary oversight: A licensed veterinarian conducts weekly health checks on all racing hamsters. Any hamster showing signs of stress or illness is immediately retired from racing.',
        ],
      },
      {
        title: '2. Ethical Racing Environment',
        content: ['Hamstar races are designed to mimic natural hamster activity such as running and exploring. The racing format prioritises the safety and comfort of the animals while creating a fun and engaging experience for viewers. No performance-enhancing substances, food deprivation, or aversive stimulation techniques are ever used.'],
      },
      {
        title: '3. Care Standards',
        content: [
          '• Clean habitat environment with daily maintenance',
          '• Proper bedding and nesting materials (paper-based, dust-free)',
          '• Balanced nutrition following veterinary dietary guidelines',
          '• Regular health monitoring with documented records',
          '• Limited race frequency (maximum 3 races per hamster per day)',
          '• 24/7 access to fresh water and exercise wheels in habitat',
          '• Retirement program for hamsters that age out of racing',
        ],
      },
      {
        title: '4. Transparency & Accountability',
        content: ['Hamstar publishes quarterly welfare reports documenting hamster health, race participation statistics, and veterinary findings. Care photos and habitat footage are available on the Pet page of the platform.'],
      },
      {
        title: '5. Reporting Concerns',
        content: ['If you have any concerns about the welfare of our hamsters, please contact us at welfare@hamstar.io. We take all reports seriously and investigate promptly.'],
      },
    ],
  },
}

const LINK_LABELS: Record<LegalModalType, string> = {
  terms:   'Terms of Use',
  risk:    'Risk Disclosure',
  privacy: 'Privacy Policy',
  welfare: 'Animal Welfare',
}

export const LEGAL_LINKS: { type: LegalModalType; label: string }[] = [
  { type: 'terms',   label: 'Terms of Use'    },
  { type: 'risk',    label: 'Risk Disclosure' },
  { type: 'privacy', label: 'Privacy Policy'  },
  { type: 'welfare', label: 'Animal Welfare'  },
]

export function LegalModal({ type, onClose }: { type: LegalModalType; onClose: () => void }) {
  const isMobile = useIsMobile()
  const [xHov, setXHov] = useState(false)
  const [closeHov, setCloseHov] = useState(false)
  const doc = DOCS[type]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 12 : 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 560,
          maxHeight: isMobile ? '95vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '20px 20px 16px' : '28px 32px 20px',
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* X close */}
          <button
            onClick={onClose}
            onMouseEnter={() => setXHov(true)}
            onMouseLeave={() => setXHov(false)}
            style={{
              position: 'absolute', top: isMobile ? 16 : 20, right: isMobile ? 16 : 20,
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: xHov ? T.border : T.bg,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: T.textMid, lineHeight: 1,
              transition: 'background 0.15s',
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: 44 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: T.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 4px 14px rgba(255,215,0,0.3)',
            }}>
              🐹
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 800, color: T.text, margin: 0 }}>
                  {doc.title}
                </h2>
                <span style={{
                  fontFamily: KANIT, fontSize: 10, fontWeight: 700,
                  color: T.purple, background: 'rgba(115,93,255,0.1)',
                  padding: '2px 8px', borderRadius: 6, letterSpacing: 0.5,
                }}>
                  HAMSTAR
                </span>
              </div>
              <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: 0 }}>
                {doc.subtitle} · {doc.version}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '16px 20px' : '22px 32px' }}>
          {doc.intro && (
            <p style={{ fontFamily: PRET, fontSize: 14, color: T.text, lineHeight: 1.7, margin: '0 0 20px' }}>
              {doc.intro}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {doc.sections.map(section => (
              <div key={section.title}>
                <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>
                  {section.title}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {section.content.map((line, i) => {
                    const isBullet = line.startsWith('•')
                    return (
                      <p key={i} style={{
                        fontFamily: PRET, fontSize: 13, color: isBullet ? T.text : T.text,
                        lineHeight: 1.65, margin: 0,
                        paddingLeft: isBullet ? 8 : 0,
                      }}>
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: '28px 0 4px', textAlign: 'center' }}>
            Hamstar © 2026. All rights reserved.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? '12px 20px 20px' : '12px 32px 20px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHov(true)}
            onMouseLeave={() => setCloseHov(false)}
            style={{
              width: '100%', padding: '13px 20px',
              background: T.yellow, border: 'none', borderRadius: 48.5,
              fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.sub2,
              cursor: 'pointer',
              opacity: closeHov ? 0.88 : 1, transition: 'opacity 0.15s',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
