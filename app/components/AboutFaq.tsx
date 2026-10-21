"use client";

import Image from "next/image";
import { useId, useState } from "react";

// Placeholder answers: the design only shows the questions.
const FAQS = [
  {
    question: "Are all your products genuine Apple?",
    answer:
      "Yes. Every device and accessory we sell is 100% genuine Apple, sourced from authorized channels and inspected before it ships.",
  },
  {
    question: "Do your products come with a warranty?",
    answer:
      "Yes. All our devices include a warranty. The coverage depends on the product and is listed on its page before you buy.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders ship within 1 to 2 business days and usually arrive in 3 to 7 business days. International orders can take a little longer, and you get tracking at every step.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Yes. You can request a return or an exchange within 14 days of delivery, as long as the product is unused and in its original packaging.",
  },
  {
    question: "What if my device arrives damaged?",
    answer:
      "Contact us within 48 hours of delivery with photos of the damage and we will arrange a replacement or a refund at no extra cost.",
  },
];

function FaqItem({ question, answer, open, onToggle }: { question: string; answer: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div
      className="w-full rounded-[20px] border border-[#2f2f2f] bg-[radial-gradient(ellipse_102px_76px_at_calc(100%-34px)_48px,#1a1a1a_0,#0c0c0c_100%)]"
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-[20px] px-[20px] py-[20px] text-left"
        >
          <span className="font-sans text-[17px] font-medium leading-[25.6px] text-white/[0.92]">{question}</span>
          <span aria-hidden="true" className="flex size-[20px] shrink-0 items-center justify-center">
            <Image
              src="/images/about_us/faq-plus.svg"
              alt=""
              width={15}
              height={15}
              className={`transition-transform duration-300 ease-out ${open ? "rotate-45" : ""}`}
            />
          </span>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p
            className={`px-[20px] pb-[20px] font-sans text-[16px] leading-[1.48] text-[#a0a0a0] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/** About us page, last section (Figma 338:75): heading on the left, accordion of questions on the right. */
export default function AboutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 flex w-full justify-center px-section pb-[120px] pt-[119px] max-notebook:pb-[90px] max-notebook:pt-[80px] max-tablet:pb-[100px] max-tablet:pt-[50px]">
      <div className="flex w-full max-w-[1264px] flex-col items-center gap-[60px] notebook:flex-row notebook:items-start notebook:justify-between notebook:gap-[146px] max-desktop:notebook:gap-[60px] max-tablet:gap-[40px]">
        <div className="flex w-full flex-col items-start justify-center gap-[18px] max-notebook:max-w-[566px] max-tablet:max-w-[527px] max-notebook:items-center max-notebook:text-center notebook:min-w-0 notebook:max-w-[552px] notebook:flex-1">
          <div
            className="relative flex h-[38px] items-center rounded-[100px] border border-white/10 px-[20px] py-[6px] backdrop-blur-[1.25px]"
            style={{ backgroundImage: "linear-gradient(0.13deg, rgba(84,84,84,0.33) 0%, rgba(54,54,54,0.1) 100%)" }}
          >
            <span
              className="bg-clip-text font-sans text-[16px] leading-[26px] text-transparent"
              style={{ backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.8) 140%, rgba(153,153,153,0) 817%)" }}
            >
              FAQ
            </span>
            <div className="absolute left-1/2 top-[-1px] h-px w-[35px] -translate-x-1/2 bg-gradient-to-r from-white/0 via-white to-white/0" />
          </div>
          <h2
            className="bg-clip-text font-display text-[38px] font-normal leading-[1.2] text-transparent max-tablet:text-[30px]"
            style={{ backgroundImage: "linear-gradient(-80.39deg, #999 14.907%, #fff 64.578%)" }}
          >
            Any questions? Here are the answers you&apos;re looking for
          </h2>
          <p className="font-sans text-[24px] leading-[1.48] text-[#a0a0a0] max-desktop:text-[20px] max-tablet:text-[18px]">
            Everything you need to know before getting started. Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll be happy to help.
          </p>
        </div>

        <div className="flex w-full flex-col gap-[14px] max-notebook:max-w-[566px] notebook:min-w-0 notebook:max-w-[566px] notebook:flex-1">
          {FAQS.map(({ question, answer }, i) => (
            <FaqItem
              key={question}
              question={question}
              answer={answer}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
