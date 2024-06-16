import { JSDOM } from "jsdom";
import { encrypt } from "./crypto";

export const onRequest = async (context, next) => {
  const response = await next();
  const originalMarkup = await response.text();

  try {
    // Get the data that we will be encrypting from the original markup
    const DOM = new JSDOM(originalMarkup);
    const toBeEncrypted = await DOM.window.document.querySelector(
      "section[data-encryptedContent]"
    ).innerHTML;

    // encode
    const encodedContent = await encrypt(
      toBeEncrypted,
      import.meta.env.PASSWORD
    );

    // replace the content and update the data attribute, then re-create like the original
    DOM.window.document.querySelector(
      "section[data-encryptedContent]"
    ).innerHTML = encodedContent;
    DOM.window.document.querySelector(
      "[data-encryptedContent]"
    ).dataset.encryptedcontent = "encrypted";
    const finalOutput =
      `<!DOCTYPE ${DOM.window.document.doctype.name}>` +
      DOM.window.document.documentElement.outerHTML;

    // return it
    return new Response(finalOutput, {
      status: 200,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(originalMarkup, {
      status: 200,
      headers: response.headers,
    });
  }
};
