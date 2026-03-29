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
import type { SiteContent } from '@/types'

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
  const [content, setContent] = useState<SiteContent | null>(null)

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_KEY)
    if (!accepted) setModal('terms')
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((d) => {
        setContent({
          streamUrl:        d.streamUrl        ?? '',
          isLive:           d.isLive           ?? false,
          raceNumber:       d.raceNumber       ?? 1,
          twitterUrl:       d.twitterUrl       ?? null,
          tiktokUrl:        d.tiktokUrl        ?? null,
          instagramUrl:     d.instagramUrl     ?? null,
          youtubeUrl:       d.youtubeUrl       ?? null,
          sponsorEmail:     d.sponsorEmail     ?? '',
          navTagline:       d.navTagline       ?? 'The smallest sport on the internet.',
          heroTitle:        d.heroTitle        ?? 'Who Will Be The Hamstar?',
          heroSubtitle:     d.heroSubtitle     ?? 'Three hamsters race. One takes the wheel.',
          heroCtaTag:       d.heroCtaTag       ?? 'Round 1 Coming Soon!',
          heroButtonText:   d.heroButtonText   ?? 'Watch Live Race',
          racersTitle:      d.racersTitle      ?? 'Meet the Racers',
          aboutTitle:       d.aboutTitle       ?? 'About Hamstar',
          aboutText:        d.aboutText        ?? '',
          arenaTitle:       d.arenaTitle       ?? 'Hamstar Arena',
          arenaSubtitle:    d.arenaSubtitle    ?? '',
          arenaStreamNote:  d.arenaStreamNote  ?? 'Race will be streamed live on Pump.fun',
          footerTagline:    d.footerTagline    ?? 'The smallest sport on the internet.',
          footerBrandDesc:  d.footerBrandDesc  ?? 'Live hamster racing powered by community participation',
          footerTaglineRight: d.footerTaglineRight ?? 'Real hamsters.\nReal races.\nOne tiny champion.',
          loginTitle:       d.loginTitle       ?? 'Welcome to Hamstar Arena 🐹',
          loginSubtitle:    d.loginSubtitle    ?? 'A live-streamed blockchain-based entertainment experience',
          termsButtonText:  d.termsButtonText  ?? 'I Understand & Enter Arena',
          howitWorksSteps:  Array.isArray(d.howitWorksSteps) && d.howitWorksSteps.length > 0 ? d.howitWorksSteps : [],
        })
      })
      .catch(() => { /* use component defaults */ })
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
        navTagline={content?.navTagline}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main>
        <HeroSection
          heroTitle={content?.heroTitle}
          heroSubtitle={content?.heroSubtitle}
          heroCtaTag={content?.heroCtaTag}
          heroButtonText={content?.heroButtonText}
          streamUrl={content?.streamUrl}
        />
        <AboutSection
          aboutTitle={content?.aboutTitle}
          aboutText={content?.aboutText}
        />
        <RacersSection
          racersTitle={content?.racersTitle}
        />
        <ArenaSection
          targetMs={targetMs}
          isLive={isLive}
          arenaTitle={content?.arenaTitle}
          arenaSubtitle={content?.arenaSubtitle}
          arenaStreamNote={content?.arenaStreamNote}
        />
      </main>

      <LandingFooter
        footerBrandDesc={content?.footerBrandDesc}
        footerTaglineRight={content?.footerTaglineRight}
        footerTagline={content?.footerTagline}
        twitterUrl={content?.twitterUrl}
        tiktokUrl={content?.tiktokUrl}
        instagramUrl={content?.instagramUrl}
        youtubeUrl={content?.youtubeUrl}
        sponsorEmail={content?.sponsorEmail}
      />

      {modal === 'terms' && (
        <TermsModal
          onAccept={handleTermsAccept}
          termsButtonText={content?.termsButtonText}
        />
      )}

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onLogin={handleLogin}
          loginTitle={content?.loginTitle}
          loginSubtitle={content?.loginSubtitle}
        />
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
          steps={content?.howitWorksSteps}
        />
      )}
    </>
  )
}
