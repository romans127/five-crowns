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
    <header className="scene-nav frost-panel">
      <div className="scene-nav__bar">
        <div className="scene-nav__leading">
          {back ? (
            <button type="button" className="scene-nav__back" onClick={back.onClick} aria-label={`Back to ${back.label}`}>
              <span className="scene-nav__chevron" aria-hidden="true">
                ‹
              </span>
              <span>{back.label}</span>
            </button>
          ) : (
            <span className="scene-nav__spacer" aria-hidden="true" />
          )}
        </div>

        <div className="scene-nav__center">
          <h1 className="scene-nav__title">{title}</h1>
          {subtitle ? <p className="scene-nav__subtitle">{subtitle}</p> : null}
        </div>

        <div className="scene-nav__trailing">
          {actions.length > 0 ? (
            actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`scene-nav__action${action.active ? ' is-active' : ''}`}
                onClick={action.onClick}
                aria-current={action.active ? 'page' : undefined}
              >
                {action.label}
              </button>
            ))
          ) : (
            <span className="scene-nav__spacer" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
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
    <nav className="scene-flow frost-tile" aria-label={label}>
      {links.map((link) => (
        <button
          key={link.label}
          type="button"
          className={`scene-flow__pill${link.active ? ' is-active' : ''}`}
          onClick={link.onClick}
          aria-current={link.active ? 'page' : undefined}
        >
          {link.label}
        </button>
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
