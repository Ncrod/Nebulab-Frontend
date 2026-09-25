import Image from "next/image";
import ScrollPlayVideo from "./ScrollPlayVideo";

type Card =
  | { kind: "image"; src: string; alt: string; width: number; height: number; size: string }
  | { kind: "video"; src: string; poster?: string; alt: string; fit: string; bg: string };

const cards: Card[] = [
  // Fills the whole card (cropping the edges a little).
  { kind: "video", src: "/videos/MacBook Neo.webm", poster: "/images/products-page/card-macbook.png", alt: "MacBook Neo", fit: "object-cover", bg: "bg-white" },
  { kind: "image", src: "/images/products-page/card-iphone.png", alt: "iPhone", width: 634, height: 520, size: "w-[72.3%]" },
  // Shown whole; the card takes the video's own background (#f3f2f5) so the two read as one piece. No poster,
  // because the video's first frame already has that background.
  { kind: "video", src: "/videos/Apple Vision Pro (3).webm", alt: "Apple Vision Pro", fit: "object-contain", bg: "bg-[#f3f2f5]" },
];

/** The three product cards under the showcase banner. The videos start as they scroll into view (looping for now, to review them; drop `loop` to play once and rest on the last frame). */
export default function ProductsCards() {
  return (
    <div className="flex gap-[40px] max-notebook:gap-[20px] max-tablet:flex-col">
      {cards.map((card) => (
        <div
          key={card.src}
          className={`relative aspect-[423/355] min-w-0 flex-1 overflow-clip rounded-[17px] ${card.kind === "video" ? card.bg : "bg-white"}`}
        >
          {card.kind === "video" ? (
            <ScrollPlayVideo
              src={card.src}
              poster={card.poster}
              label={card.alt}
              loop
              className={`absolute inset-0 size-full ${card.fit}`}
            />
          ) : (
            <Image
              src={card.src}
              alt={card.alt}
              width={card.width}
              height={card.height}
              sizes="(min-width: 1440px) 520px, 40vw"
              className={`absolute left-1/2 top-1/2 h-auto max-w-none -translate-x-1/2 -translate-y-1/2 ${card.size}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
