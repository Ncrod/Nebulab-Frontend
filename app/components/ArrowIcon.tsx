/**
 * Circular arrow icon for buttons. Put `group` on the parent button/link:
 * on hover the arrow rotates 35deg clockwise to point straight right.
 */
export default function ArrowIcon({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-background"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        className="origin-center transition-transform duration-300 ease-out group-hover:rotate-[35deg]"
      >
        <path
          d="M15.4458 27.8192L14.3186 26.2095L26.1168 17.9482L16.2288 16.4905L16.5383 14.6339L28.8107 16.5478L29.4385 17.4444L27.0538 29.6517L25.1688 29.3015L27.1829 19.6008L15.4458 27.8192Z"
          fill="white"
        />
      </svg>
    </span>
  );
}
