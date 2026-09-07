import { Button, ListRow, ListSection, type ButtonProps } from '@ios27_design_system/react'

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
