import { Button, ListRow, ListSection, TextField, type ButtonProps } from '@ios27_design_system/react'
import type { ReactNode } from 'react'

function mergeClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function PrimaryButton({ className, ...props }: ButtonProps) {
  return <Button variant="filled" size="large" className={mergeClassName('gn-btn-block', className)} {...props} />
}

export function GlassButton({ className, ...props }: ButtonProps) {
  return <Button variant="liquid-glass" size="large" className={mergeClassName('gn-btn-block', className)} {...props} />
}

export function TintedButton({ className, ...props }: ButtonProps) {
  return <Button variant="tinted" size="large" className={mergeClassName('gn-btn-block', className)} {...props} />
}

export function TextButton({ className, ...props }: ButtonProps) {
  return <Button variant="plain" className={className} {...props} />
}

export function ActionList({
  items,
}: {
  items: Array<{ key?: string; label: string; onClick: () => void }>
}) {
  return (
    <ListSection>
      {items.map((item, index) => (
        <ListRow
          key={item.key ?? item.label}
          disclosure
          separator={index < items.length - 1}
          onClick={item.onClick}
        >
          {item.label}
        </ListRow>
      ))}
    </ListSection>
  )
}

export function PlayerNameField({
  index,
  name,
  suit,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number
  name: string
  suit: ReactNode
  canRemove: boolean
  onChange: (value: string) => void
  onRemove: () => void
}) {
  return (
    <ListRow
      leading={suit}
      trailing={
        canRemove ? (
          <Button variant="plain" size="small" aria-label={`Remove player ${index + 1}`} onClick={onRemove}>
            ✕
          </Button>
        ) : undefined
      }
    >
      <TextField
        value={name}
        maxLength={18}
        autoCapitalize="words"
        placeholder={`Player ${index + 1}`}
        aria-label={`Player ${index + 1} name`}
        onChange={onChange}
      />
    </ListRow>
  )
}

export function PlayerScoreRow({
  name,
  detail,
  suit,
  scoreLabel,
  entered,
  onClick,
  separator = true,
}: {
  name: string
  detail: string
  suit: ReactNode
  scoreLabel: string | number
  entered: boolean
  onClick: () => void
  separator?: boolean
}) {
  return (
    <ListRow
      leading={suit}
      trailing={<span className={`hand-score ${entered ? 'in' : 'open'}`}>{scoreLabel}</span>}
      separator={separator}
      onClick={onClick}
    >
      <span className="player-meta">
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
    </ListRow>
  )
}

export function HistoryGameRow({
  when,
  headline,
  meta,
  onOpen,
  separator = true,
}: {
  when: string
  headline: string
  meta: string
  onOpen: () => void
  separator?: boolean
}) {
  return (
    <ListRow disclosure separator={separator} onClick={onOpen}>
      <span className="history-row-copy">
        <span className="history-when">{when}</span>
        <strong>{headline}</strong>
        <span className="history-meta">{meta}</span>
      </span>
    </ListRow>
  )
}
