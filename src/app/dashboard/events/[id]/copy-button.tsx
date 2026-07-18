'use client'

import { useState, useEffect } from 'react'

export function CopyButton({ text, slug }: { text?: string, slug: string }) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState('')

  useEffect(() => {
    setFullUrl(`${window.location.origin}/public/events/${slug}`)
  }, [slug])

  const handleCopy = async () => {
    const copyText = text || fullUrl
    if (!copyText) return
    
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between border border-border-light">
      <div className="overflow-hidden pr-4">
        <div className="text-label-sm text-[12px] font-medium text-text-muted mb-1">Link Registrasi Publik</div>
        <div className="font-body-md text-[16px] text-secondary truncate max-w-[200px] md:max-w-xs select-all">
          {fullUrl}
        </div>
      </div>
      <button 
        onClick={handleCopy}
        title="Salin Link"
        className="text-text-muted hover:text-secondary transition-colors p-2 rounded-md hover:bg-surface-container-highest flex-shrink-0"
      >
        <span className="material-symbols-outlined">
          {copied ? 'check' : 'content_copy'}
        </span>
      </button>
    </div>
  )
}
