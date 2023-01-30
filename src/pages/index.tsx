import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Signature from "./components/Signature";

const signatureExample = {
  name: "Example Signature",
  chain: "0x5",
  types: {
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
  },
  domain: {
    name: "Ether Mail",
    version: "1",
    chainId: 5,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  },
  primaryType: "Example",
  message: {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
};

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    }
  }, [isConnected]);

  return (
    <div>
      <div className="flex justify-between content-center flex-row">
        <div className="text-3xl p-10">Micropayments</div>
        <div className="p-10">
          <ConnectButton />
        </div>
      </div>
      {account && (
        <div>
          {account}
          <Signature {...signatureExample} />
        </div>
      )}
    </div>
  );
};

export default Home;
