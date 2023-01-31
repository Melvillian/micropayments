import { useSignTypedData } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import Button from "./Button";
import { useEffect } from "react";

export default function Signature(props: any) {
  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain: props.domain,
      types: props.types,
      value: props.value,
    });

  const runSignature = async () => {
    await switchNetwork({
      chainId: props.chain,
    });
    signTypedData();
  };

  useEffect(() => {
    if (isSuccess) {
      sendSignature();
    }
  }, [isSuccess]);

  const sendSignature = async () => {
    const from = props.address;
    const name = props.name;
    const types = props.types;
    const value = props.value;
    const domain = props.domain;
    const chain = props.chain;
    const primaryType = props.primaryType;

    const endpoint = "/api/signature";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        name,
        types,
        value,
        domain,
        chain,
        primaryType,
        data, // signature
      }),
    };

    const response = await fetch(endpoint, options);
    const result = await response.json();
    alert(`Your signature: ${JSON.stringify(result)}`);
  };

  return (
    <div className="flex flex-col">
      <div>Signature</div>
      <div>{props.chain}</div>
      <div>{props.name}</div>

      <Button
        className=" border-2 border-black rounded-lg p-2"
        disabled={isLoading}
        onClick={runSignature}
      >
        Execute
      </Button>

      <div className="break-all">
        {isSuccess && <div>Signature: {data}</div>}
      </div>
      <div className="break-all">
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}
