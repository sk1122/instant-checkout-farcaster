// Two very important environment variables to set that you MUST set in Vercel:
// - SYNDICATE_API_KEY: The API key for your Syndicate project. If you're on the
// demo plan, DM @Will on Farcaster/@WillPapper on Twitter to get upgraded.
// - NEYNAR_API_KEY: The API key for your Neynar project. Without this,
// addresses won't be able to be extracted from FIDs for minting
import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios"

export default async function (req: VercelRequest, res: VercelResponse) {
  // Farcaster Frames will send a POST request to this endpoint when the user
  // clicks the button. If we receive a POST request, we can assume that we're
  // responding to a Farcaster Frame button click.
  if (req.method == "POST") {
    try {
      console.log("req.body", req.body);

      const fid = req.body.untrustedData.fid;
      const username = await getAddrByFid(fid)

      const request = await axios({
        url: "https://staging-api.fetcch.xyz/v1/transaction-request",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "secret-key": "1a5181c3-2d69-4c1f-9b11-9912f2a9ada9"
        },
        data: {
            // "payer": "0xF93480Eb81e7Ff26A5b79d2D610B8648f645b950",
            "receiver": "0x88942c2A454c56141592B0B7a42d78929fEB5F4b",
            "actions": [
                {
                    "type": "PAYMENT",
                    "data": {
                        "token": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
                        "chain": 5,
                        "receiver": "0x88942c2A454c56141592B0B7a42d78929fEB5F4b",
                        "amount": {
                            "amount": "100000",
                            "currency": "CRYPTO"
                        }
                    }
                }
            ],
            "message": "FARCASTER",
            "label": "FARCASTER"
        }
      })

      const postCast = await axios({
        url: "https://api.neynar.com/v2/farcaster/cast",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "api_key": "57705239-E1D4-4F8B-9079-C0324230C8CD"
        },
        data: {
          "signer_uuid": "119374d2-391c-4662-9736-86db3188dc2a",
          "text": `Instant checkout by Fetcch for @${username}, link - https://request.fetcch.xyz/request/${(await request.data).data.id}`
        }
      })

      res.status(200).setHeader("Content-Type", "text/html").send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
          <meta property="og:title" content="Instant Checkout powered by Fetcch" />
          <meta
            property="og:image"
            content="https://instant-checkout-farcaster.vercel.app/img/checkout.png"
          />
          <meta property="fc:frame" content="vNext" />
          <meta
            property="fc:frame:image"
            content="https://instant-checkout-farcaster.vercel.app/img/checkout.png"
          />
          <meta
            property="fc:frame:button:1"
            content="Check your notification box"
          />
          <meta
            name="fc:frame:post_url"
            content="https://instant-checkout-farcaster.vercel.app/api/checkout"
          />
        </head>
      </html>
    `);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  } else {
    // If the request is not a POST, we know that we're not dealing with a
    // Farcaster Frame button click. Therefore, we should send the Farcaster Frame
    // content
    res.status(200).setHeader("Content-Type", "text/html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="Instant Checkout by Fetcch" />
        <meta
          property="og:image"
          content="https://instant-checkout-farcaster.vercel.app/img/fetcch.png"
        />
        <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content="https://instant-checkout-farcaster.vercel.app/img/fetcch.png"
        />
        <meta property="fc:frame:button:1" content="Instant Checkout" />
        <meta
          name="fc:frame:post_url"
          content="https://instant-checkout-farcaster.vercel.app/api/checkout"
        />
      </head>
    </html>
    `);
  }
}

// Based on https://github.com/coinbase/build-onchain-apps/blob/b0afac264799caa2f64d437125940aa674bf20a2/template/app/api/frame/route.ts#L13
async function getAddrByFid(fid: number) {
  console.log("Extracting address for FID: ", fid);
  const options = {
    method: "GET",
    url: `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    headers: {
      accept: "application/json",
      api_key: "57705239-E1D4-4F8B-9079-C0324230C8CD" || "",
    },
  };
  console.log("Fetching user address from Neynar API");
  const resp = await fetch(options.url, { headers: options.headers });
  console.log("Response: ", resp);
  const responseBody = await resp.json(); // Parse the response body as JSON
  if (responseBody.users) {
    const userVerifications = responseBody.users[0];
    return userVerifications.username
  }
  return "0x0000000000000000000000000000000000000000";
}
