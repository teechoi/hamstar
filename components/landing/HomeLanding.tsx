'use client'
import { useState, useEffect } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { AboutSection } from '@/components/landing/AboutSection'
import { RacersSection } from '@/components/landing/RacersSection'
import { ArenaSection } from '@/components/landing/ArenaSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { TermsModal } from '@/components/landing/TermsModal'
import { LoginModal } from '@/components/landing/LoginModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { AccountModal } from '@/components/landing/AccountModal'

const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'howitworks' | 'account' | null

interface HomeLandingProps {
  targetMs: number
  isLive: boolean
}

export function HomeLanding({ targetMs, isLive }: HomeLandingProps) {
  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_KEY)
    if (!accepted) setModal('terms')
  }, [])

  const handleTermsAccept = () => {
    localStorage.setItem(TERMS_KEY, '1')
    setModal('login')
  }

  const handleLogin = () => {
    // TODO: wire up real auth (Google OAuth / Web3Auth / Phantom)
    setAuthed(true)
    setModal(null)
  }

  const handleDisconnect = () => {
    setAuthed(false)
    setWalletAddress('')
    setBalance('0')
    setModal(null)
  }

  return (
    <>
      <LandingNav
        authed={authed}
        balance={authed && balance !== '0' ? balance : undefined}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main>
        <HeroSection />
        <AboutSection />
        <RacersSection />
        <ArenaSection targetMs={targetMs} isLive={isLive} />
      </main>

      <LandingFooter />

      {modal === 'terms' && (
        <TermsModal onAccept={handleTermsAccept} />
      )}

      {modal === 'login' && (
        <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} />
      )}

      {modal === 'deposit' && (
        <DepositModal
          address={walletAddress}
          onClose={() => setModal(null)}
          onConnectWallet={() => {
            // TODO: trigger Phantom wallet connection
            setModal(null)
          }}
        />
      )}

      {modal === 'account' && (
        <AccountModal
          walletAddress={walletAddress || undefined}
          balance={balance !== '0' ? balance : undefined}
          onClose={() => setModal(null)}
          onDeposit={() => setModal('deposit')}
          onDisconnect={handleDisconnect}
          onConnectWallet={() => {
            // TODO: trigger Phantom wallet connection
            setModal(null)
          }}
        />
      )}

      {modal === 'howitworks' && (
        <HowItWorksModal
          onClose={() => setModal(null)}
          onEnterArena={() => setModal(authed ? null : 'login')}
        />
      )}
    </>
  )
}
