import { Button, Toolbar } from '@ios27_design_system/react'
import type { ReactNode } from 'react'

export type SceneNavAction = {
  label: string
  onClick: () => void
  active?: boolean
}

type SceneNavProps = {
  back?: SceneNavAction
  title: string
  subtitle?: string
  actions?: SceneNavAction[]
}

export function SceneNav({ back, title, subtitle, actions = [] }: SceneNavProps) {
  return (
    <div className="scene-nav-wrap">
      <Toolbar
        className="scene-nav"
        title={title}
        leading={
          back ? (
            <Button variant="plain" onClick={back.onClick} aria-label={`Back to ${back.label}`}>
              ‹ {back.label}
            </Button>
          ) : undefined
        }
        trailing={
          actions.length > 0 ? (
            <div className="scene-nav__actions">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant="plain"
                  onClick={action.onClick}
                  aria-current={action.active ? 'page' : undefined}
                  className={action.active ? 'is-active' : undefined}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : undefined
        }
      />
      {subtitle ? <p className="scene-nav__subtitle">{subtitle}</p> : null}
    </div>
  )
}

type SceneFlowProps = {
  links: SceneNavAction[]
  label?: string
}

export function SceneFlow({ links, label = 'Quick navigation' }: SceneFlowProps) {
  if (links.length === 0) {
    return null
  }

  return (
    <nav className="scene-flow scene-flow--scroll" aria-label={label}>
      {links.map((link) => (
        <Button
          key={link.label}
          variant={link.active ? 'filled' : 'tinted'}
          size="small"
          onClick={link.onClick}
          aria-current={link.active ? 'page' : undefined}
        >
          {link.label}
        </Button>
      ))}
    </nav>
  )
}

type SceneShellProps = {
  nav: SceneNavProps
  flowLinks?: SceneNavAction[]
  flowLabel?: string
  children: ReactNode
  className?: string
}

export function SceneShell({ nav, flowLinks, flowLabel, children, className }: SceneShellProps) {
  return (
    <section className={`screen scene-shell${className ? ` ${className}` : ''}`}>
      <SceneNav {...nav} />
      <h1 className="sr-only">{nav.title}</h1>
      {flowLinks ? <SceneFlow links={flowLinks} label={flowLabel} /> : null}
      <div className="scene-body">{children}</div>
    </section>
  )
}

type SceneStageProps = {
  sceneKey: string
  transition: 'forward' | 'back' | 'none'
  children: ReactNode
}

export function SceneStage({ sceneKey, transition, children }: SceneStageProps) {
  return (
    <div key={sceneKey} className={`scene-stage scene-stage--${transition}`}>
      {children}
    </div>
  )
}
