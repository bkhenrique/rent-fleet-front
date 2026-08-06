'use client';

import { useTranslations } from 'next-intl';
import { PhoneIcon, MailIcon, WhatsAppIcon } from '@/components/contact-icons';

interface ContactActionsProps {
  telefone?: string | null;
  email?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

const SIZE_CLASS: Record<'sm' | 'md', string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
};

/** Botões de ligar/WhatsApp/e-mail — reaproveitável em qualquer lugar que mostre telefone/e-mail de
 * cliente (detalhe, lista, alertas do painel). Sem integração paga: `tel:`/`mailto:` nativos do
 * navegador e um link `wa.me` puro (WhatsApp não exige API pra isso). */
export function ContactActions({ telefone, email, size = 'sm', className = '' }: ContactActionsProps) {
  const t = useTranslations('contact');

  if (!telefone && !email) return null;

  const iconSize = size === 'sm' ? 14 : 16;
  const buttonClass = `flex shrink-0 items-center justify-center rounded-md text-foreground-dim transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${SIZE_CLASS[size]}`;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      {telefone && (
        <a href={`tel:${telefone}`} className={buttonClass} title={t('call')} aria-label={t('call')}>
          <PhoneIcon size={iconSize} />
        </a>
      )}
      {telefone && (
        <a
          href={`https://wa.me/${digitsOnly(telefone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          title={t('whatsapp')}
          aria-label={t('whatsapp')}
        >
          <WhatsAppIcon size={iconSize} />
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={buttonClass} title={t('email')} aria-label={t('email')}>
          <MailIcon size={iconSize} />
        </a>
      )}
    </span>
  );
}
