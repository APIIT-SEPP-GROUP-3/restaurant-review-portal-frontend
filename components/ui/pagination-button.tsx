import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type PaginationButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
};

export function PaginationButton({ href, children, disabled, className = "", ...props }: PaginationButtonProps) {
  const classes = `pagination-button ${className}`;
  if (href && !disabled) {
    return <Link href={href} className={classes} aria-label={props["aria-label"]} aria-current={props["aria-current"]}>{children}</Link>;
  }
  return <button {...props} type={props.type ?? "button"} disabled={disabled} className={classes}>{children}</button>;
}
