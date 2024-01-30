# Fetcch Instant Checkout for Farcaster

This is an example of an instant checkout system for farcaster

You can checkout our webhooks and other APIs on our [documentation](https://docs.fetcch.xyz) or our [notion](https://fetcch.notion.site/Integration-Doc-for-Farcaster-4d1e9d6fd4ee4b3f8f8821272a0409cb?pvs=4)

## Usage

Add your Fetcch API Key in `.env` as `FETCCH_API_KEY`

**Code**

```typescript
const request = await axios({
    url: "https://staging-api.fetcch.xyz/v1/transaction-request",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "secret-key": process.env.FETCCH_API_KEY
    },
    data: {
        // "payer": "0xF93480Eb81e7Ff26A5b79d2D610B8648f645b950",
        "receiver": "0x88942c2A454c56141592B0B7a42d78929fEB5F4b", // your address
        "actions": [
            {
                "type": "PAYMENT",
                "data": {
                    "token": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // token address
                    "chain": 5, // chain id as per `https://docs.fetcch.xyz/how-to-integrate/blockchain`
                    "receiver": "0x88942c2A454c56141592B0B7a42d78929fEB5F4b", // your address
                    "amount": {
                        "amount": "100000", // amount in lowest denominator
                        "currency": "CRYPTO"
                    }
                }
            }
        ],
        "message": "FARCASTER",
        "label": "FARCASTER"
    }
})
```

Then get your `api_key` and `signer_uuid` from neynar.com

```typescript
const postCast = await axios({
    url: "https://api.neynar.com/v2/farcaster/cast",
    method: "POST",
    headers: {
        "content-type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY
    },
    data: {
        "signer_uuid": process.env.SIGNER_UUID,
        "text": `Instant checkout by Fetcch for @${username}, link - https://request.fetcch.xyz/request/${(await request.data).data.id}`
    }
})
```

```typescript
async function getAddrByFid(fid: number) {
    console.log("Extracting address for FID: ", fid);
    const options = {
        method: "GET",
        url: `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY || "",
        },
    };
    console.log("Fetching user address from Neynar API");
    const resp = await fetch(options.url, { headers: options.headers });
    console.log("Response: ", resp);
    const responseBody = await resp.json(); // Parse the response body as JSON
    if (responseBody.users) {
        const users = responseBody.users[0];
        return users.username
    }
    return "no_username";
}
```

Thanks to @willpapper for his [repo](github.com/willpapper/on-chain-cow-farcaster-frame)