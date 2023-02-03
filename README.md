# Micropayments

A hackathon project showcasing an efficient (both in terms of gas, and UX) micropayments protocol implemented on Ethereum

# Useful commands

## Deploy scripts

### PermitERC20

Deploy a fake ERC20 token that implements `permit`. the address corresponding to your
`PRIVATE_KEY` environment variable will be given 1_000 TEST token:

`npx hardhat run scripts/deploy_permit_erc20.ts --network sepolia`

set the `NEXT_PUBLIC_ERC20_ADDRESS` environment variable to the address deployed by the above script.

### PaymentChannel

Deploy the PaymentChannel.sol contract:

`npx hardhat run scripts/deploy_payment_channel.ts --network sepolia`

set the `NEXT_PUBLIC_PAYMENT_CHANNEL_ADDRESS` environment variable to the address deployed by the above script.

Finally, set the `NEXT_PUBLIC_RECIPIENT_ADDRESS` environment variable to be the address that you want to receive payment
to via the micropayment channel, and get an OpenAI API key and set it on the `OPENAI_API_KEY` environment variable.

## The Next.js App

Getting the app working locally:

```
docker-compose up # run local Postgres database
yarn dev # run migrations and start app
```

# Hints:

1. DEV API url example: http://localhost:3000/api/signature
2. PROD API url example: https://micropayments.vercel.app/api/signature
