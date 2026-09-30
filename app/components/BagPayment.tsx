"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { errorMessage, useSession } from "../lib/api";
import type { Cart } from "../lib/cart";
import { isExpiryValid } from "../lib/cms/card";
import { placeOrder } from "../lib/cms/orders";
import { showToast } from "../lib/toast";

const label = "font-display text-[20px] font-medium leading-[22.5px] text-[#050505]";
const frame = "flex items-center rounded-[12px] border border-[#050505] px-[15px]";
const field =
  "min-w-0 bg-transparent font-sans text-[17px] font-normal leading-normal text-black/50 outline-none placeholder:text-black/50";

const money = (amount: number) => `$ ${amount.toFixed(2)}`;

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

/** "1234567812345678" -> "1234 5678 1234 5678" (a space only appears between digits, so it can be deleted). */
const formatCardNumber = (value: string) => (digitsOnly(value, 16).match(/.{1,4}/g) ?? []).join(" ");

/** "1226" -> "12/26" (the slash appears with the third digit, so it can be deleted). */
function formatExpiry(value: string) {
  const digits = digitsOnly(value, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/**
 * Payment details: contact and card fields, the totals and the pay button. Paying is a mock: the button only works once
 * every field is complete and valid (16-digit card, a valid unexpired MM/YY, 3-digit code, holder, shipping address); then
 * it sends the order to the API (../lib/cms/orders), which empties the bag. Only the shipping address and the last 4 digits
 * of the card leave the browser: the email is the account's, and the totals are the server's.
 */
export default function BagPayment({ cart }: { cart: Cart }) {
  const email = useSession("customer")?.user.email ?? "";
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [holder, setHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  // Until the shopper types something the hint is generic; after that it names the next thing that is missing.
  const [touched, setTouched] = useState(false);
  // What the server refused (blocked account, no stock...), until the shopper changes something.
  const [refused, setRefused] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const edit = (setter: (value: string) => void, value: string) => {
    setTouched(true);
    setRefused(null);
    setter(value);
  };
  const { subtotal, taxRate, tax, total } = cart;
  const empty = cart.items.length === 0;

  /** What is still wrong with the form, or null when it is complete. */
  const missing = (() => {
    if (!address.trim()) return "Enter your shipping address.";
    if (!city.trim()) return "Enter your city.";
    if (!postalCode.trim()) return "Enter your postal code.";
    if (!country.trim()) return "Enter your country.";
    if (digitsOnly(cardNumber, 16).length !== 16) return "Enter the 16 digits of your card.";
    if (digitsOnly(expiry, 4).length !== 4) return "Enter the expiry date as MM/YY.";
    if (!isExpiryValid(expiry)) return "That expiry date is not valid or the card has expired.";
    if (cvc.length !== 3) return "Enter the 3-digit security code.";
    if (!holder.trim()) return "Enter the name on the card.";
    return null;
  })();
  const ready = !empty && missing === null && !paying;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    const shippingAddress = { address: address.trim(), city: city.trim(), postalCode: postalCode.trim(), country: country.trim() };
    setPaying(true);
    setRefused(null);
    let order;
    try {
      order = await placeOrder({ shippingAddress, cardLast4: cardNumber.slice(-4) });
    } catch (error) {
      setRefused(errorMessage(error));
      return;
    } finally {
      setPaying(false);
    }
    showToast(`Order ${order.number} placed`);
    setTouched(false);
    setAddress("");
    setCity("");
    setPostalCode("");
    setCountry("");
    setHolder("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
  }

  return (
    <div className="flex min-w-0 flex-col gap-[57px] max-notebook:gap-[36px]">
      <div className="flex max-w-[464px] flex-col gap-[12px]">
        <h2 className="font-display text-[36px] font-medium leading-[1.045] text-black max-tablet:text-[30px]">Payment Details</h2>
        <p className="font-sans text-[24px] leading-normal text-black/75 max-desktop:text-[20px] max-tablet:text-[18px]">
          Complete your item providing your payment details order.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[572px] flex-col gap-[23px] max-notebook:max-w-none">
        <div className="flex flex-col gap-[19px]">
          <div className="flex flex-col gap-[15px]">
            <label htmlFor="bag-email" className={label}>
              Email Address
            </label>
            {/* The order goes to the account's email: it cannot be changed here. */}
            <input id="bag-email" type="email" autoComplete="email" placeholder="your@email.com" value={email} readOnly title="Your order is sent to the email of your account" className={`${frame} ${field} w-full py-[20px]`} />
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="bag-address" className={label}>
              Shipping Address
            </label>
            <input id="bag-address" autoComplete="street-address" placeholder="Street and number" value={address} onChange={(e) => edit(setAddress, e.target.value)} className={`${frame} ${field} w-full py-[20px]`} />
            <div className="flex gap-[15px] max-[460px]:flex-col">
              <input aria-label="City" autoComplete="address-level2" placeholder="City" value={city} onChange={(e) => edit(setCity, e.target.value)} className={`${frame} ${field} min-w-0 flex-1 py-[20px]`} />
              <input aria-label="Postal code" autoComplete="postal-code" placeholder="Postal code" value={postalCode} onChange={(e) => edit(setPostalCode, e.target.value)} className={`${frame} ${field} w-[190px] py-[20px] max-[460px]:w-full`} />
            </div>
            <input aria-label="Country" autoComplete="country-name" placeholder="Country" value={country} onChange={(e) => edit(setCountry, e.target.value)} className={`${frame} ${field} w-full py-[20px]`} />
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="bag-card" className={label}>
              Card Detail
            </label>
            {/* Up to 460px the row is compacted (smaller type, fields and gaps) so number, MM/YY and CVC still fit on one line. */}
            <div className={`${frame} justify-between gap-[14px] py-[13px] max-[460px]:gap-[10px] max-[460px]:px-[12px]`}>
              <div className="flex min-w-0 flex-1 items-center gap-[10px] py-[4px] max-[460px]:gap-[8px]">
                <Image src="/svg/bag/card.svg" alt="" width={24} height={24} className="shrink-0 max-[460px]:size-[20px]" />
                <input
                  id="bag-card"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => edit(setCardNumber, formatCardNumber(e.target.value))}
                  className={`${field} w-full max-[460px]:text-[14px]`}
                />
              </div>
              <div className="flex shrink-0 items-center gap-[14px] max-[460px]:gap-[8px]">
                <input
                  aria-label="Expiry date"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => edit(setExpiry, formatExpiry(e.target.value))}
                  className={`${field} w-[64px] max-[460px]:w-[48px] max-[460px]:text-[14px]`}
                />
                <div aria-hidden="true" className="flex h-[29px] w-0 shrink-0 items-center justify-center">
                  <Image src="/svg/bag/divider.svg" alt="" width={29} height={1} className="w-[29px] max-w-none flex-none rotate-90" />
                </div>
                <input
                  aria-label="Security code"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVC"
                  maxLength={3}
                  value={cvc}
                  onChange={(e) => edit(setCvc, digitsOnly(e.target.value, 3))}
                  className={`${field} w-[40px] max-[460px]:w-[30px] max-[460px]:text-[14px]`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="bag-holder" className={label}>
              Card Holder
            </label>
            <input id="bag-holder" autoComplete="cc-name" placeholder="Name" value={holder} onChange={(e) => edit(setHolder, e.target.value)} className={`${frame} ${field} w-full py-[20px]`} />
          </div>
        </div>

        <div className="flex flex-col gap-[23px]">
          <dl className="m-0 flex flex-col gap-[24px] font-sans text-[20px] font-medium leading-normal text-[#050505]">
            <div className="flex items-center justify-between">
              <dt>Subtotal</dt>
              <dd className="m-0">{money(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Tax ({Math.round(taxRate * 100)}%)</dt>
              <dd className="m-0">{money(tax)}</dd>
            </div>
            <div className="flex items-center justify-between font-bold">
              <dt>Total</dt>
              <dd className="m-0">{money(total)}</dd>
            </div>
          </dl>

          {refused && (
            <p role="alert" className="m-0 font-sans text-[16px] leading-normal text-[#c62828]">
              {refused}
            </p>
          )}
          {!empty && missing && (
            <p id="pay-hint" className="m-0 font-sans text-[16px] leading-normal text-black/60">
              {touched ? missing : "Fill in all the payment details to pay."}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready}
            aria-describedby={!empty && missing ? "pay-hint" : undefined}
            className="flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[200px] bg-[#050505] px-[31px] py-[23px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-white transition-opacity duration-200 hover:opacity-80 disabled:cursor-default disabled:opacity-40"
          >
            Pay {money(total)}
          </button>
        </div>

        <div className="flex justify-center">
          <Image src="/svg/bag/mark.svg" alt="" width={53} height={53} />
        </div>
      </form>
    </div>
  );
}
