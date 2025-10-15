/**
 * Centers content and constrains width across breakpoints.
 * Pages can opt into wider or narrower variants when needed.
 */
function ResponsiveContainer({ as: Component = "div", className, variant = "default", children, ...rest }) {
  const variantClass =
    variant === "wide"
      ? " responsive-container--wide"
      : variant === "narrow"
        ? " responsive-container--narrow"
        : ""
  const composedClassName = `responsive-container${variantClass}${className ? ` ${className}` : ""}`

  return (
    <Component
      className={composedClassName}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default ResponsiveContainer
