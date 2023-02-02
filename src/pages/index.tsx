import { PaymentChannel } from "@prisma/client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Signature from "./components/Signature";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [account, setAccount] = useState("");
  const [data, setData] = useState("");
  const [chatGPT, setChatGPT] = useState("");
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<any | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    }
  }, [isConnected]);

  const startPaymentChannel = async (e: any) => {
    e.preventDefault();
    const { message } = e.target;
    const endpoint = "/api/chat";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: account,
        contents: message.value,
      }),
    };

    const response = await fetch(endpoint, options);
    const result = await response.json();

    setPaymentChannel(result);
  };

  const header = () => {
    return (
      <div className="flex justify-between content-center flex-row">
        <div className="text-3xl p-10">Micropayments</div>
        <div className="p-10">
          <ConnectButton />
        </div>
      </div>
    );
  };

  const noPaymentChannel = () => {
    return (
      <div className="p-2 flex flex-col">
        Prompt:
        <form onSubmit={startPaymentChannel} className={"flex flex-col"}>
          <input
            className="p-4 border-2 border-black rounded-lg "
            placeholder="what is life?"
            type="text"
            id="message"
            name="message"
          />
          <div className="pt-4">
            <button
              className="border-2 border-black rounded-lg p-2 w-[50%]"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  };

  const loggedOut = () => {
    return (
      <div>
        <div>Not connected</div>
      </div>
    );
  };

  const closePaymentChannel = () => {
    return (
      <>
        {loading ? (
          <>Loading result...</>
        ) : (
          <>
            <div>Result</div>
            <div>{chatGPT}</div>
            <button
              onClick={submitClosePaymentChannel}
              className="border-2 border-black rounded-lg p-2 w-[50%]"
            >
              close payment channel
            </button>
          </>
        )}
      </>
    );
  };

  const signPaymentChannel = () => {
    const signature = paymentChannel.signature;
    return (
      <>
        <Signature
          domain={signature.domain}
          types={signature.types}
          value={signature.value}
          chain={signature.chain}
          address={account}
          name={signature.name}
          primaryType={signature.primaryType}
          success={signatureSigned}
        />
      </>
    );
  };

  const signatureSigned = async (data: string) => {
    setLoading(true);
    setData(data);
    const endpoint = `/api/chat/submit/${paymentChannel.id}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: account,
        data: data,
      }),
    };

    const result = await fetch(endpoint, options);

    if (!result.ok) {
      setChatGPT("Error");
    } else {
      const response = await result.json();
      setChatGPT(response.result.choices[0].text);
    }

    setLoading(false);
  };

  const submitClosePaymentChannel = async () => {
    const endpoint = `/api/chat/close/${paymentChannel.id}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    };

    const response = await fetch(endpoint, options);
    const result = await response.json();
    if (response.ok) {
      setClosed(true);
    } else {
      alert(result.error);
    }
  };

  const loggedIn = () => {
    return (
      <div>
        <div className="pb-20">Connected: {account}</div>
        {/* <Signature {...{ address: account, ...signatureExample }} /> */}
        {/* {!paymentChannel && noPaymentChannel()}
        {paymentChannel && (!data || data === "") && signPaymentChannel()}
        {!closed && data && closePaymentChannel()}
        {closed && <div>Payment Channel Closed</div>} */}
      </div>
    );
  };

  return (
    <div>
      <div>{header()}</div>
      <div className="p-10">{!account ? loggedOut() : loggedIn()}</div>
    </div>
  );
};

export default Home;
