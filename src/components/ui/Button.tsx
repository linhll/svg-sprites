import { forwardRef, type ButtonHTMLAttributes } from 'react'
import './Button.scss'

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'danger-outline'
  | 'ghost'
  /** Remove (×) on icon card (paired with `.icon-card` styles) */
  | 'icon-card-remove'

export type ButtonSize = 'default' | 'small'

/** `bare`: only `className` + type reset, for buttons with their own styles (e.g. sidebar). */
export type ButtonSurface = 'default' | 'bare'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  surface?: ButtonSurface
  /** Defaults to `button` to avoid accidental form submit */
  type?: 'button' | 'submit' | 'reset'
}

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(' ')
}

function variantClasses(variant: ButtonVariant): string[] {
  const base = ['btn']
  switch (variant) {
    case 'default':
      break
    case 'primary':
      base.push('btn-primary')
      break
    case 'accent':
      base.push('btn-accent')
      break
    case 'danger-outline':
      base.push('btn-danger-outline')
      break
    case 'ghost':
      base.push('btn-ghost')
      break
    case 'icon-card-remove':
      base.push('btn-icon-remove')
      break
    default:
      break
  }
  return base
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      surface = 'default',
      className,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    if (surface === 'bare') {
      return (
        <button ref={ref} type={type} className={className} {...rest} />
      )
    }
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          ...variantClasses(variant),
          size === 'small' && 'btn-small',
          className,
        )}
        {...rest}
      />
    )
  },
)

Button.displayName = 'Button'
