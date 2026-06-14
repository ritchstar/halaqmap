type Props = {
  className?: string;
  title?: string;
};

/** أيقونة بشت SVG — للفلتر وكرت تجهيز العريس (بدون emoji Unicode). */
export function SaudiBishtIcon({ className = 'h-4 w-4', title }: Props) {
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
      <path
        d="M4 7.5c2.2-1.2 4.8-1.8 8-1.8s5.8.6 8 1.8v1.2l-1.2 11.5c-.1.8-.8 1.3-1.6 1.3H6.8c-.8 0-1.5-.5-1.6-1.3L4 8.7V7.5z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M6.5 8.2c2.8-1 5.7-1.2 8.5-1.2 2.8 0 5.7.2 8.5 1.2"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M8 10.5h8M7.5 13h9M8 15.5h8"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M12 5.2v2.4M9.2 6.1l1.4 1.6M14.8 6.1l-1.4 1.6"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
