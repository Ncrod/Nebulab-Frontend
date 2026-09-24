import Image from "next/image";

const benefits = [
  {
    title: "Verified products",
    description: "New and curated devices, inspected to guarantee quality and authenticity.",
    icon: "/svg/icon-check.svg",
  },
  {
    title: "Secure shipping",
    description: "Tracking at every step and protected packaging until it reaches your door.",
    icon: "/svg/icon-headset.svg",
  },
  {
    title: "Real support",
    description: "We are here before, during and after your purchase, with real answers from real people.",
    icon: "/svg/icon-truck.svg",
  },
];

function IconBadge({ icon }: { icon: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative size-[58px] shrink-0 overflow-clip rounded-full border-[1.278px] border-white/[0.13] shadow-[0px_0.403px_1.209px_-0.558px_rgba(192,192,192,0.08),0px_1.532px_4.595px_-1.115px_rgba(192,192,192,0.1),0px_6.692px_20.077px_-1.673px_rgba(192,192,192,0.18)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-[#131313] to-[#0d0d0d]" />
      <div className="absolute inset-[calc(-40.99%-2.33px)_calc(-11.43%-1.57px)_calc(69.89%+0.51px)_calc(51.46%+0.04px)]">
        <div className="absolute inset-[-84.4%_-100.04%]">
          <Image src="/svg/badge-glow.svg" alt="" width={104} height={111} className="block size-full max-w-none" />
        </div>
      </div>
      <Image
        src={icon}
        alt=""
        width={31}
        height={31}
        className="absolute left-1/2 top-1/2 size-[31.231px] -translate-x-1/2 -translate-y-1/2"
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_11.154px_5.577px_-1.115px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

export default function Benefits() {
  return (
    <section className="flex w-full flex-col items-center justify-center px-section pb-[232px] pt-[169px]">
      <div className="flex w-full max-w-[1271px] flex-col items-center gap-[50px] notebook:flex-row notebook:items-start notebook:gap-[83px]">
        <h2 className="w-full min-w-0 flex-none self-center text-center max-notebook:max-w-[615px] notebook:text-left notebook:sticky notebook:top-[120px] notebook:w-auto notebook:flex-[614] notebook:self-start font-display text-[64px] font-medium leading-[1.045] text-white max-desktop:text-[44px] notebook:max-desktop:max-w-[470px]">
          Buying technology should{" "}
          <span className="bg-gradient-to-r from-white to-[#666] bg-clip-text text-transparent">
            feel this simple
          </span>
        </h2>

        <ul className="flex w-full min-w-0 flex-none notebook:w-auto notebook:flex-[574] flex-col items-start gap-[71px] max-desktop:max-w-[520px]">
          {benefits.map(({ title, description, icon }) => (
            <li key={title} className="flex w-full items-center gap-[42px]">
              <IconBadge icon={icon} />
              <div className="flex min-w-px flex-1 flex-col items-start leading-[normal]">
                <p className="w-full font-display text-[40px] font-normal text-white max-desktop:text-[30px]">{title}</p>
                <p className="w-full font-sans text-[24px] text-[#a0a0a0] max-desktop:text-[20px]">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
