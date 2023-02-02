import "@/styles/globals.css";
import type { AppProps } from "next/app";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
// import { alchemyProvider } from "wagmi/providers/alchemy";

const { chains, provider } = configureChains(
  [sepolia],
  [
    infuraProvider({ apiKey: "e91a292e11584df8b746b55db859dee5" }),
    // alchemyProvider({ apiKey: "G-Uc_pdqbIAwHnom2xALqLjaYIJbPDvN" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Micropayments",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
