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

  const sendChatMessage = async (e) => {
    e.preventDefault();
    const { message } = e.target;
    const endpoint = "/api/chat";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.value,
      }),
    };

    const response = await fetch(endpoint, options);
    const result = await response.json();
    alert(`Your answer: ${JSON.stringify(result)}`);
  };

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
          <div className="p-2">
            <form onSubmit={sendChatMessage}>
              <input
                className="p-2"
                placeholder="what is life?"
                type="text"
                id="message"
                name="message"
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
