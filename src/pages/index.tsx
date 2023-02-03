import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Signature from "./components/Signature";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState("");
  // const [account, setAccount] = useState("");
  const [signingKeyAddress, setsigningKeyAddress] = useState("");
  const [permitTuple, setPermitTuple] = useState<any>(null);
  const [unsignedPermitPayload, setUnsignedPermitPayload] = useState<any>(null);

  // SKM = SigningKeyMessage
  const [skmTuple, setSKMTuple] = useState<any>(null);
  const [unsignedSKMPayload, setUnsignedSKMPayload] = useState<any>(null);

  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [responseHistory, setResponseHistory] = useState<string[]>([]);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
      const signer = ethers.Wallet.createRandom();
      setsigningKeyAddress(signer.address);
    }
  }, [isConnected]);

  const loggedOut = () => {
    return (
      <div>
        <div>Not connected</div>
      </div>
    );
  };

  const startPaymentChannelComponent = () => {
    if (unsignedPermitPayload || permitTuple) {
      return;
    }

    return (
      <form onSubmit={startPaymentChannel} className={"flex flex-col"}>
        <input
          className="p-4 border-2 border-black rounded-lg "
          placeholder="what is life?"
          type="text"
          id="prompt"
          name="prompt"
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
    );
  };

  const permitSignatureSuccess = async (data: string) => {
    console.log("permit signature success");
    console.log(data);
    const { v, r, s } = ethers.utils.splitSignature(data);
    console.log({ v, r, s });
    setPermitTuple({ v, r, s });

    const endpoint = `/api/paymentChannel/signingKeyMessage/${unsignedPermitPayload.paymentChannelId}`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        v: v,
        r: r,
        s: s,
      }),
    };

    const response = await fetch(endpoint, options);
    if (response.status !== 200) {
      return;
    }

    setUnsignedSKMPayload(await response.json());
  };

  const signUnsignedPermitPayloadComponent = () => {
    if (permitTuple || !unsignedPermitPayload) return;

    return (
      <Signature
        domain={unsignedPermitPayload.domain}
        types={unsignedPermitPayload.types}
        value={unsignedPermitPayload.values}
        chain={unsignedPermitPayload.domain.chainId}
        address={account}
        name={unsignedPermitPayload.domain.name}
        primaryType={"Permit"}
        message={"Permit USDC"}
        success={permitSignatureSuccess}
      />
    );
  };

  const signingKeySuccess = async (data: string) => {
    setLoading(true);
    console.log("success signingKeySuccess");
    console.log(data);
    const { v, r, s } = ethers.utils.splitSignature(data);
    console.log(`signing key message sig: {${v}, ${r}, ${s}}`);
    setSKMTuple({ v, r, s });

    const endpoint = `/api/paymentChannel/chat/${unsignedPermitPayload.paymentChannelId}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptHistory[0],
      }),
    };

    const response = await fetch(endpoint, options);
    if (response.status !== 200) {
      setResponseHistory(["error"]);
      return;
    }

    const result = await response.json();
    setResponseHistory([result.result]);
    setLoading(false);
  };

  const signSigningKeyMessageComponent = () => {
    if (!permitTuple || !unsignedSKMPayload || skmTuple) return;
    return (
      <Signature
        domain={unsignedSKMPayload.domain}
        types={unsignedSKMPayload.types}
        value={unsignedSKMPayload.values}
        chain={unsignedSKMPayload.domain.chainId}
        address={account}
        name={unsignedSKMPayload.domain.name}
        primaryType={"Signing Key"}
        message={"Authorize Signing Key"}
        success={signingKeySuccess}
      />
    );
  };

  const submitPrompt = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    const endpoint = `/api/paymentChannel/chat/${unsignedPermitPayload.paymentChannelId}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    };

    const promptHistoryCopy = [...promptHistory];
    promptHistoryCopy.push(e.target.prompt.value);
    setPromptHistory(promptHistoryCopy);

    let gptResponse = "error";

    const response = await fetch(endpoint, options);

    if (response.status === 200) {
      const result = await response.json();
      gptResponse = result.result;
    }

    const responseHistoryCopy = [...responseHistory];
    responseHistoryCopy.push(gptResponse);
    setResponseHistory(responseHistoryCopy);

    setLoading(false);
  };

  const chatLoop = () => {
    if (!permitTuple || !unsignedSKMPayload || !skmTuple) return;

    return (
      <div className="flex flex-col">
        {promptHistory.map((prompt, index) => {
          return (
            <div key={index} className="flex flex-row">
              <div className="border-2 border-black rounded-lg p-2 w-[50%]">
                You: {prompt}
              </div>
              <div className="border-2 border-black rounded-lg p-2 w-[50%]">
                Chat GPT: {responseHistory[index]}
              </div>
            </div>
          );
        })}
        <form onSubmit={submitPrompt} className={"pt-4 flex flex-col"}>
          <input
            className="p-4 border-2 border-black rounded-lg "
            placeholder="what is life?"
            type="text"
            id="prompt"
            name="prompt"
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

  const closeChannelOnClick = async () => {};
  const closeChannel = () => {
    if (!permitTuple || !unsignedSKMPayload || !skmTuple) return;

    return (
      <div className="pt-4">
        <button
          onClick={closeChannelOnClick}
          className="border-2 border-black rounded-lg p-2 w-[50%]"
          type="submit"
        >
          Close Channel
        </button>
      </div>
    );
  };

  const loggedIn = () => {
    return (
      <div>
        <div className="">Connected: {account}</div>
        <div className="pb-20">Signing key: {signingKeyAddress}</div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <>{startPaymentChannelComponent()}</>
            <>{signUnsignedPermitPayloadComponent()}</>
            <>{signSigningKeyMessageComponent()}</>
            <>{chatLoop()}</>
            <>{closeChannel()}</>
          </>
        )}
      </div>
    );
  };

  const startPaymentChannel = async (e: any) => {
    e.preventDefault();
    const { prompt } = e.target;

    setPromptHistory([prompt.value]);
    const endpoint = "/api/paymentChannel";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: account,
        signingKeyAddress: signingKeyAddress,
      }),
    };

    const response = await fetch(endpoint, options);
    const result = await response.json();
    console.log(`/api/paymentChannel resp: ${JSON.stringify(result)}`);
    setUnsignedPermitPayload(result);
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

  return (
    <>
      <div>
        <div>{header()}</div>
        <div className="p-10">{!account ? loggedOut() : loggedIn()}</div>
      </div>
    </>
  );
};

export default Home;
