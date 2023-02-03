# Micropayments

A hackathon project showcasing an efficient (both in terms of gas, and UX) micropayments protocol implemented on Ethereum

# Useful commands

## Deploy scripts

Deploy a fake ERC20 token that implements `permit`. the address corresponding to your
PRIVATE_KEY environment variable will be given 1_000 TEST token:

`npx hardhat run scripts/deploy_permit_erc20.ts --network sepolia`

Deploy the PaymentChannel.sol contract:

`npx hardhat run scripts/deploy_payment_channel.ts --network sepolia`

## The Next.js App

Getting the app working locally:

```
docker-compose up # run local Postgres database
yarn dev # run migrations and start app
```

# Hints:

1. DEV API url example: http://localhost:3000/api/signature
2. PROD API url example: https://micropayments.vercel.app/api/signature
