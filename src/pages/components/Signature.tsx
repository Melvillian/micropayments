import { useSignTypedData } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { useEffect } from "react";
import Button from "./Button";

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
      props.success(data);
    }
  }, [isSuccess]);

  return (
    <div className="flex flex-col">
      {/* <div className="underline">Signature Details</div>
      <div>Chain: {props.chain}</div>
      <div>Name: {props.name}</div>
      <div>Primary Type: {props.primaryType}</div>
      <div>Domain: {JSON.stringify(props.domain)}</div>
      <div>Types: {JSON.stringify(props.types)}</div>
      <div>Value: {JSON.stringify(props.value)}</div> */}
      <div className="pt-4">
        <Button
          className=" border-2 border-black rounded-lg p-2 m-4"
          disabled={isLoading}
          onClick={runSignature}
        >
          {props.message || "Sign"}
        </Button>
      </div>
      <div className="break-all">
        {isSuccess && <div>Signature: {data}</div>}
      </div>
      <div className="break-all">
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}
