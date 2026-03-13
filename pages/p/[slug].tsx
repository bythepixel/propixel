import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { prisma } from '../../lib/prisma'
import { useEffect } from 'react'

interface WebViewProps {
    proposal: any
}

export default function ProposalWebView({ proposal }: WebViewProps) {
    const { title, company, client, stylePalette } = proposal
    const palette = stylePalette || {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E293B',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        headingColor: '#000000',
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Outfit, sans-serif',
    }

    useEffect(() => {
        // Basic Engagement Tracking
        const startTime = Date.now()
        let maxScroll = 0

        const trackEngagement = async () => {
            const duration = Math.round((Date.now() - startTime) / 1000)
            const scrollPercentage = Math.round((maxScroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0

            try {
                await fetch('/api/proposals/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposalId: proposal.id,
                        duration,
                        maxScroll: scrollPercentage,
                    }),
                })
            } catch (e) {
                console.error('Failed to track engagement')
            }
        }

        const handleScroll = () => {
            const currentScroll = window.scrollY
            if (currentScroll > maxScroll) maxScroll = currentScroll
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('beforeunload', trackEngagement)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('beforeunload', trackEngagement)
        }
    }, [proposal.id])

    return (
        <div className="min-h-screen" style={{
            backgroundColor: palette.backgroundColor,
            color: palette.textColor,
            fontFamily: palette.fontFamily
        }}>
            <Head>
                <title>{title} | ProPixel Proposal</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@600;800&display=swap" rel="stylesheet" />
                <style>{`
          h1, h2, h3 { font-family: ${palette.headingFont}; color: ${palette.headingColor}; }
          .btn-primary { background-color: ${palette.primaryColor}; color: white; }
          .accent-text { color: ${palette.accentColor}; }
        `}</style>
            </Head>

            <main className="max-w-4xl mx-auto py-20 px-6">
                <header className="mb-16 border-b pb-8">
                    <h1 className="text-6xl font-extrabold mb-4">{title}</h1>
                    <p className="text-xl opacity-80">
                        For <span className="font-bold">{company?.name}</span> •
                        Attention: <span className="italic">{client?.firstName} {client?.lastName}</span>
                    </p>
                </header>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">Strategic Overview</h2>
                    <div className="prose prose-lg max-w-none text-opacity-90">
                        <p>Welcome to your customized proposal from ProPixel. This document outlines our strategic approach to your requirements.</p>
                    </div>
                </section>

                <section className="mb-12 p-8 rounded-xl bg-gray-50 border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-3">Proposed Solution</h2>
                    <p>Our AI-driven recommendation engine has identified the following strategic blocks as the most relevant to your project goals.</p>
                </section>

                <div className="mt-20 flex justify-between items-center border-t pt-8">
                    <button className="btn-primary px-8 py-3 rounded-lg font-bold">Accept Proposal</button>
                    <p className="text-sm opacity-60">© {new Date().getFullYear()} ProPixel</p>
                </div>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const slug = params?.slug as string
    const proposal = await prisma.proposal.findUnique({
        where: { slug },
        include: {
            company: true,
            client: true,
            stylePalette: true,
        },
    })

    if (!proposal) {
        return { notFound: true }
    }

    return {
        props: {
            proposal: JSON.parse(JSON.stringify(proposal)),
        },
    }
}
