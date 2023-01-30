import { useSignTypedData } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import Button from "./Button";

export default function Signature(props: any) {
  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain: props.domain,
      types: props.types,
      value: props.message,
    });

  const runSignature = async () => {
    await switchNetwork({
      chainId: props.chain,
    });
    signTypedData();
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
