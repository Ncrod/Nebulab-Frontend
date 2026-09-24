import Image from "next/image";

const cardShadow =
  "shadow-[232px_317px_110px_0px_rgba(0,0,0,0.01),149px_203px_101px_0px_rgba(0,0,0,0.05),84px_114px_85px_0px_rgba(0,0,0,0.16),37px_51px_63px_0px_rgba(0,0,0,0.28),9px_13px_35px_0px_rgba(0,0,0,0.32)]";
const cardBase = `flex w-full flex-col items-start overflow-clip rounded-[16px] border-[1.5px] border-[#2d2d2d] max-notebook:shadow-none ${cardShadow}`;
const cardTall =
  "bg-[radial-gradient(ellipse_500px_330px_at_16px_0,#232323_0,#181818_50%,#0d0d0d_100%)]";
const cardShort =
  "bg-[radial-gradient(ellipse_470px_100px_at_16px_0,#232323_0,#181818_50%,#0d0d0d_100%)]";

function CardTitle({ icon, gap, children }: { icon: string; gap: string; children: string }) {
  return (
    <div className={`flex items-center overflow-clip ${gap}`}>
      <Image src={icon} alt="" width={24} height={24} className="size-[24px] shrink-0" />
      <h3 className="font-display text-[24px] font-normal leading-[28px] text-white whitespace-nowrap">
        {children}
      </h3>
    </div>
  );
}

function CardText({ children }: { children: string }) {
  return (
    <p className="w-full font-sans text-[20px] leading-[1.48] text-[#a0a0a0]">{children}</p>
  );
}

export default function Offer() {
  return (
    <section className="relative w-full overflow-x-clip pt-[68px] max-tablet:pt-[34px] notebook:h-[1249px] notebook:pt-0">
      {/* Light spilling over the raised centre of the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(50%-157.5px)] top-[4px] h-[165px] w-[332px] max-tablet:origin-top max-tablet:scale-[0.6]"
      >
        <div className="absolute inset-[-266.97%_-132.68%_-260.91%_-132.68%]">
          <Image src="/svg/offer-glow.svg" alt="" width={1213} height={1036} className="block size-full max-w-none" />
        </div>
      </div>

      {/* Panel */}
      <div className="relative overflow-clip border-t border-[#363636] bg-[#0b0b0c] pb-[200px] pt-[38px] notebook:absolute notebook:inset-x-0 notebook:top-[68px] notebook:h-[1181px] notebook:p-0">
        <div className="flex justify-center px-section notebook:absolute notebook:inset-x-0 notebook:top-[38px]">
        <div className="flex w-full max-w-[1100px] flex-col items-center gap-[83px]">
          <div className="flex w-full max-w-[815px] flex-col items-center justify-center gap-[12px]">
            <div
              className="relative flex items-center gap-[10px] rounded-[100px] border border-white/10 px-[30px] py-[15px] backdrop-blur-[1.25px]"
              style={{ backgroundImage: "linear-gradient(0.08deg, rgba(84,84,84,0.33) 0%, rgba(54,54,54,0.1) 100%)" }}
            >
              <p className="font-sans text-[20px] leading-[26px] whitespace-nowrap text-white/70">What we offer</p>
              <div className="absolute left-[calc(50%+0.5px)] top-[-1px] h-px w-[100px] -translate-x-1/2 bg-gradient-to-r from-white/0 via-white to-white/0" />
            </div>
            <h2
              className="min-w-full bg-clip-text text-center font-display text-[44px] max-tablet:text-[40px] font-normal leading-[1.2] text-transparent"
              style={{ backgroundImage: "linear-gradient(-66.55deg, #999 14.907%, #fff 64.578%)" }}
            >
              Everything you need, all in one place
            </h2>
            <p className="w-full max-w-[583px] text-center font-sans text-[20px] leading-[1.46] text-[#a9a9a9]">
              Discover Apple products and accessories carefully selected to enhance your everyday experience.
            </p>
          </div>

          <div className="flex w-full max-w-[550px] flex-col items-stretch justify-center gap-[22px] notebook:max-w-none notebook:flex-row">
            <div className="flex w-full min-w-0 flex-none flex-col items-start gap-[22px] notebook:w-auto notebook:flex-[544.52]">
              <div className={`${cardBase} ${cardTall} max-desktop:flex-1 px-[29px] py-[35px] max-tablet:px-[20px] max-tablet:py-[20px]`}>
                <div className="flex w-full flex-col items-center gap-[26px]">
                  <div className="flex w-full flex-col items-start gap-[13px]">
                    <CardTitle icon="/svg/icon-apple.svg" gap="gap-[9px]">Apple Products</CardTitle>
                    <CardText>
                      Discover the latest iPhone, iPad, Mac, Apple Watch and more, with products selected for quality and performance.
                    </CardText>
                  </div>
                  <div className="flex w-full max-w-[483.519px] flex-col items-start overflow-clip rounded-[20px] border-[0.961px] border-white/[0.09] bg-[#0e0e0e] p-[9.613px] shadow-[0px_0.579px_1.274px_-0.561px_rgba(0,0,0,0.09),0px_2.2px_4.84px_-1.121px_rgba(0,0,0,0.1),0px_9.613px_21.148px_-1.682px_rgba(0,0,0,0.16)]">
                    <div className="relative h-[307.595px] w-full shrink-0 overflow-clip rounded-[13.731px] border-[0.577px] border-white/20 bg-white">
                      <video
                        src="/videos/vid-iphone.webm"
                        poster="/images/offer/apple-products.png"
                        autoPlay
                        loop
                        muted
                        playsInline
                        aria-hidden="true"
                        className="absolute inset-0 size-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${cardBase} ${cardShort} flex-1 px-[31px] py-[35px] max-tablet:px-[20px] max-tablet:py-[20px]`}>
                <div className="flex w-full flex-col items-start gap-[13px]">
                  <CardTitle icon="/svg/icon-headphones.svg" gap="gap-[8px]">Accessories</CardTitle>
                  <CardText>
                    Complete your setup with chargers, cases, cables and accessories designed for your Apple devices.
                  </CardText>
                </div>
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-none flex-col items-start gap-[22px] notebook:w-auto notebook:flex-[526]">
              <div className={`${cardBase} ${cardShort} max-desktop:flex-1 px-[30px] py-[35px] max-tablet:px-[20px] max-tablet:py-[20px]`}>
                <div className="flex w-full flex-col items-start gap-[13px]">
                  <CardTitle icon="/svg/icon-sparkles.svg" gap="gap-[6px]">For Your Everyday</CardTitle>
                  <CardText>
                    Find the right products to make your work, entertainment and everyday life more seamless.
                  </CardText>
                </div>
              </div>

              <div className={`${cardBase} ${cardShort} max-desktop:flex-1 px-[30px] py-[34px] max-tablet:px-[20px] max-tablet:py-[20px]`}>
                <div className="flex w-full flex-col items-start gap-[13px]">
                  <CardTitle icon="/svg/icon-diamond.svg" gap="gap-[8px]">Premium Selection</CardTitle>
                  <CardText>
                    Carefully selected products that combine functionality, design and the quality you expect.
                  </CardText>
                </div>
              </div>

              <div className={`${cardBase} ${cardTall} relative order-first flex-1 gap-[30px] notebook:order-none desktop:min-h-[362px] px-[30px] py-[34px] max-tablet:px-[20px] max-tablet:py-[20px]`}>
                <div className="flex w-full flex-col items-start gap-[13px]">
                  <CardTitle icon="/svg/icon-chart.svg" gap="gap-[9px]">Upgrade Your Setup</CardTitle>
                  <CardText>
                    From essential accessories to your next Apple device, find everything you need to build the perfect setup.
                  </CardText>
                </div>
                <Image
                  src="/images/offer/watchh.webp"
                  alt=""
                  width={1070}
                  height={535}
                  className="pointer-events-none -mb-[61px] max-tablet:-mb-[20px] h-auto w-[calc(100%-50px)] max-w-[476px] self-center desktop:absolute desktop:left-[calc(50%+0.24px)] desktop:top-[151px] desktop:mb-0 desktop:h-[238px] desktop:w-[476px] desktop:-translate-x-1/2 desktop:self-auto desktop:object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Raised, curved top edge of the panel */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[69px] w-full max-w-[1490px] -translate-x-1/2 max-tablet:h-[35px] max-tablet:w-[480px]">
        <Image src="/svg/offer-edge.svg" alt="" width={1490} height={69} className="size-full max-w-none" />
      </div>
    </section>
  );
}
