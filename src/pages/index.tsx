import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers, Signer } from "ethers";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount,  } from "wagmi";
import { fetchSigner } from '@wagmi/core';
import Signature from "./components/Signature";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [openTab, setOpenTab] = useState(1);

  const [account, setAccount] = useState("");
  const [signingKeyAddress, setsigningKeyAddress] = useState("");
  const [signingKeySigner, setSigningKeySigner] = useState<Signer | null>(null);

  const [permitTuple, setPermitTuple] = useState<any>(null);
  const [unsignedPermitPayload, setUnsignedPermitPayload] = useState<any>(null);

  // SKM = SigningKeyMessage
  const [skmTuple, setSKMTuple] = useState<any>(null);
  const [unsignedSKMPayload, setUnsignedSKMPayload] = useState<any>(null);

  // micropayment message
  const [amount, setAmount] = useState<any>(1);
  const [mpmTuple, setMPMTuple] = useState<any>(null);

  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [responseHistory, setResponseHistory] = useState<string[]>([]);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
      const signer = ethers.Wallet.createRandom();
      setsigningKeyAddress(signer.address);
      setSigningKeySigner(signer);
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
    const { v, r, s } = ethers.utils.splitSignature(data);
    console.log(`permit message sig: {${v}, ${r}, ${s}}`);
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

    const result = await response.json();

    // TODO: this is a hack to get the correct PermitERC20 nonce. The
    // correct thing to do is to store the correct value on the DB.
    // actually.. it's probably best to not have duplicate data on the blockchain
    // and on the DB, so we should probably fetch the nonce from the blockchain

    // fetch nonce from permit
    const signer = await fetchSigner();
    const erc20 = new ethers.Contract(
      process.env.NEXT_PUBLIC_ERC20_ADDRESS!,
      ERC20PermitABI,
      signer as Signer
    );
    const nonce = await erc20.nonces(result.values.permitMsg.owner)
    result.values.permitMsg.nonce = nonce.toString()

    setUnsignedSKMPayload(result);
  };

  const signUnsignedPermitPayloadComponent = () => {
    if (permitTuple || !unsignedPermitPayload) return;
    console.log(`unsignedPermitPayload: ${JSON.stringify(unsignedPermitPayload, null, 2)}`);

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
    const { v, r, s } = ethers.utils.splitSignature(data);
    console.log(`signing key message sig: {${v}, ${r}, ${s}}`);
    setSKMTuple({ v, r, s });

    const signedMicropaymentMessage = await signMicropaymentMessage(unsignedPermitPayload.paymentChannelId, amount);
    setMPMTuple(signedMicropaymentMessage);

    const endpoint = `/api/paymentChannel/chat/${unsignedPermitPayload.paymentChannelId}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptHistory[0],
        signedMicropaymentMessage,
      }),
    };

    const response = await fetch(endpoint, options);
    if (response.status !== 200) {
      setResponseHistory(["error"]);
      return;
    }

    console.log(`MPMTuple: ${JSON.stringify(mpmTuple, null, 2)}`)

    const result = await response.json();
    setResponseHistory([result.result.gptPayload]);
    setAmount(result.result.unsignedPaymentMessage.amount);
    setLoading(false);
  };

  const signSigningKeyMessageComponent = () => {
    if (!permitTuple || !unsignedSKMPayload || skmTuple) return;
    console.log(`unsignedSKMPayload: ${JSON.stringify(unsignedSKMPayload, null, 2)}`);

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

  const signMicropaymentMessage = async (id: number, amount: BigNumber) => {
    const paymentChannelContract =
      process.env.NEXT_PUBLIC_PAYMENT_CHANNEL_ADDRESS;

    const domain = {
      name: "PaymentChannel",
      version: "1",
      chainId: 11155111,
      verifyingContract: paymentChannelContract,
    };
    const types = {
      MicropaymentMessage: [
        { name: "id", type: "uint256" },
        { name: "amount", type: "uint256" },
      ],
    };
    const values = {
      id,
      amount,
    };
    const signature = await signingKeySigner?._signTypedData(
      domain,
      types,
      values
    );
    console.log(`unsignedMicropaymentMessage: ${JSON.stringify({
      domain,
      types,
      values,
    }, null, 2)}`);
    console.log(`MPMTuple: ${JSON.stringify(ethers.utils.splitSignature(signature), null, 2)}`)

    return ethers.utils.splitSignature(signature);
  };

  const submitPrompt = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    const signedMicropaymentMessage = await signMicropaymentMessage(unsignedPermitPayload.paymentChannelId, amount);
    setMPMTuple(signedMicropaymentMessage);

    const endpoint = `/api/paymentChannel/chat/${unsignedPermitPayload.paymentChannelId}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
        signedMicropaymentMessage,
      }),
    };

    const promptHistoryCopy = [...promptHistory];
    promptHistoryCopy.push(e.target.prompt.value);
    setPromptHistory(promptHistoryCopy);

    let gptResponse = "error";
    const response = await fetch(endpoint, options);

    if (response.status === 200) {
      const result = await response.json();
      gptResponse = result.result.gptPayload;
      setAmount(result.result.unsignedPaymentMessage.amount);
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

  // call paymentChannel.settleChannel() so that the service provider
  // can be paid
  const closeChannelOnClick = async () => {
    const signer = await fetchSigner();
    const paymentChannelContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_PAYMENT_CHANNEL_ADDRESS!,
      PaymentChannelABI,
      signer as Signer
    );

    const erc20 = new ethers.Contract(
      process.env.NEXT_PUBLIC_ERC20_ADDRESS!,
      ERC20PermitABI,
      signer as Signer
    );
    const nonce = (await erc20.nonces(unsignedPermitPayload.values.owner)).toString();

    const signingKeyMessage = {
      id: unsignedPermitPayload.paymentChannelId,
      token: process.env.NEXT_PUBLIC_ERC20_ADDRESS,
      signingKeyAddress,
      recipient: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS,
      permitMsg: {
        owner: unsignedPermitPayload.values.owner,
        spender: unsignedPermitPayload.values.spender,
        value: unsignedPermitPayload.values.value,
        nonce,
        deadline: unsignedPermitPayload.values.deadline,
        v: permitTuple.v,
        r: permitTuple.r,
        s: permitTuple.s,
      },
      v: skmTuple.v,
      r: skmTuple.r,
      s: skmTuple.s,
    };
    console.log(`signingKeyMessage: ${JSON.stringify(signingKeyMessage, null, 2)}`);

    const micropaymentMessage = {
      id: unsignedPermitPayload.paymentChannelId,
      amount: amount - 1, // amount holds the next amount to be signed,
      // so we need to subtract 1 to get the current amount
      v: mpmTuple.v,
      r: mpmTuple.r,
      s: mpmTuple.s,
    };
    console.log(`micropaymentMessage: ${JSON.stringify(micropaymentMessage, null, 2)}`);

    console.log("attempting to settle channel");
    const txReceipt = await paymentChannelContract.settleChannel(
        signingKeyMessage,
        micropaymentMessage
    );
    
    console.log("waiting for settleChannel tx to be mined");
    await txReceipt.wait();

    console.log("channel closed with id: " + unsignedPermitPayload.paymentChannelId);
  };
  const closeChannel = () => {
    if (!permitTuple || !unsignedSKMPayload || !skmTuple) return "No Channel";

    return (
      <div className="pt-4">
        <button
          onClick={closeChannelOnClick}
          className="border-2 border-black rounded-lg p-2 w-[75%]"
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

    // TODO: this is a hack to get the correct PermitERC20 nonce. The
    // correct thing to do is to store the correct value on the DB.
    // actually.. it's probably best to not have duplicate data on the blockchain
    // and on the DB, so we should probably fetch the nonce from the blockchain

    // fetch nonce from permit
    const signer = await fetchSigner();
    const erc20 = new ethers.Contract(
      process.env.NEXT_PUBLIC_ERC20_ADDRESS!,
      ERC20PermitABI,
      signer as Signer
    );
    const nonce = await erc20.nonces(result.values.owner)
    result.values.nonce = nonce.toString()

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

  const tabs = () => {
    return (
      <div>
        <div className="flex flex-col items-center justify-center">
          <ul className="flex justify-between items-center flex-row">
            <li>
              <a
                href="#"
                onClick={() => setOpenTab(1)}
                className=" px-4 py-2 mx-10 text-gray-600 bg-white rounded shadow"
              >
                User
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setOpenTab(2)}
                className="px-4 py-2 mx-10 text-gray-600 bg-white rounded shadow"
              >
                Admin
              </a>
            </li>
          </ul>
          <div className="pt-10">
            <div className={openTab === 1 ? "block" : "hidden"}>
              {loggedIn()}
            </div>
            <div className={openTab === 2 ? "block" : "hidden"}>
              {closeChannel()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <div>{header()}</div>
        <div className="p-10">{!account ? loggedOut() : tabs()}</div>
      </div>
    </>
  );
};

export default Home;


const PaymentChannelABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "blockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "DeadlineTooEarly",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "IdAlreadyUsed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "skMsgId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mpMsgId",
        "type": "uint256"
      }
    ],
    "name": "InvalidId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInputLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMicropaymentMessageSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSigningMessageSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "InvalidSpender",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "signingKeyAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ChannelSettled",
    "type": "event"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "signingKeyAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
              },
              {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
              },
              {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
              }
            ],
            "internalType": "struct PaymentChannel.Permit",
            "name": "permitMsg",
            "type": "tuple"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PaymentChannel.SigningKeyMessage",
        "name": "skMsg",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PaymentChannel.MicropaymentMessage",
        "name": "mpMsg",
        "type": "tuple"
      }
    ],
    "name": "settleChannel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "signingKeyAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
              },
              {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
              },
              {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
              }
            ],
            "internalType": "struct PaymentChannel.Permit",
            "name": "permitMsg",
            "type": "tuple"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PaymentChannel.SigningKeyMessage[]",
        "name": "skMsgs",
        "type": "tuple[]"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PaymentChannel.MicropaymentMessage[]",
        "name": "mpMsgs",
        "type": "tuple[]"
      }
    ],
    "name": "settleChannels",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const ERC20PermitABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];