type Props = {
  className?: string;
  title?: string;
};

/** أيقونة متخصص أطفال — SVG (بدون emoji Unicode). */
export function ChildrenSpecialistIcon({ className = 'h-4 w-4', title }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="7.5" r="3.2" fill="currentColor" opacity="0.9" />
      <path
        d="M6.5 19.5c.8-3.2 2.8-4.8 5.5-4.8s4.7 1.6 5.5 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M16.2 5.8l2.1-1.2M19.8 8.6l2.2-.3M17.6 11.4l1.8 1.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="18.8" cy="4.6" r="1.1" fill="currentColor" opacity="0.45" />
      <circle cx="21.2" cy="9.1" r="0.85" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
