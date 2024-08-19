# Verax Security Attestations

This project aims to provide a way to issue attestations of security, leveraging
the [Verax Attestation Registry](https://www.ver.ax/).

## Disclaimer

This is a proof of concept, without any decent UI and should not be used in production.

## How to use

```bash
npm i
```

```bash
npm run dev
```

## Example of parameters to use

1. Monitored Contract Address: `0xF35fe79104e157703dbCC3Baa72a81A99591744D`
2. Monitoring Level: `Level 1`
3. dApp Name: `Verax proof of security`
4. Expiry Date: `30/06/2050`

## Portal on Linea Sepolia

[`0x59c28fb3240af0fb209a1ac848f5cab387585106`](https://explorer.ver.ax/linea-sepolia/portals/0x59c28fb3240af0fb209a1ac848f5cab387585106)

## Schema on Linea Sepolia

[`0x4495ace11dc84fb96437f8fa7f07244a357ea29ca28e2bd71ca6fb826265b216`](https://explorer.ver.ax/linea-sepolia/schemas/0x4495ace11dc84fb96437f8fa7f07244a357ea29ca28e2bd71ca6fb826265b216)  
`(uint256 monLevel, string dAppName)`
