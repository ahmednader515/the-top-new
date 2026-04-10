"use client";

import Link from "next/link";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100071620771234&rdid=R4MQLNcEMLMpjSRZ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1J3xX2iexp%2F#";
const YOUTUBE_URL = "https://www.youtube.com/channel/UC40vCWrvO5j61aKpPoj6qKQ";

// Size knobs
const BUTTON_SIZE_CLASS = "h-12 w-12"; // overall button size (padding feel)
const ICON_SIZE_CLASS = "h-8 w-8"; // icon size inside button

function SocialButton({
  href,
  label,
  bgClass,
  children,
}: {
  href: string;
  label: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={[
        "flex items-center justify-center rounded-full shadow-lg",
        "transition-transform hover:scale-[1.03] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
        BUTTON_SIZE_CLASS,
        bgClass,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function HomeSocialFabs() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-4">
        <SocialButton href={FACEBOOK_URL} label="Facebook" bgClass="bg-[#1877F2] text-white hover:bg-[#166FE5]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className={`${ICON_SIZE_CLASS} shrink-0 fill-current`}>
            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
          </svg>
        </SocialButton>

        <SocialButton href={YOUTUBE_URL} label="YouTube" bgClass="bg-[#FF0000] text-white hover:bg-[#E60000]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className={`${ICON_SIZE_CLASS} shrink-0 fill-current`}>
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.5V8.5L15.8 12l-6.2 3.5Z" />
          </svg>
        </SocialButton>
      </div>
    </div>
  );
}
