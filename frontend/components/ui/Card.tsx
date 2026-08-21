"use client";

import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Component = "div",
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}) {
  return (
    <Component
      className={`card ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

Card.displayName = "Card";