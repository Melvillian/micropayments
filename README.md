# Micropayments

## TODO

### Smart Contract

- [x] Implement EIP-712 signing payloads
- [x] Implement transfer business logic
- [x] Implement EIP-712 verification logic
- [ ] Unit tests
- [ ] System tests

### Frontend

- [ ] signing key generation
- [ ] EIP-712 signing key logic
- [ ] Micropayment EIP-712 signing logic

### Server

- [x] setup database
- [ ] signing key message route
- [ ] Micropayment message route
- [ ] periodic batch settleChannels cron-job (could also be scheduled lambda function)`

# Useful commands

Getting the app working locally:

```
docker-compose up # run local database
yarn dev # run migrations and start app
```

# Hints:

1. DEV API url example: http://localhost:3000/api/signature
2. PROD API url example: https://micropayments.vercel.app/api/signature
