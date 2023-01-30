export default function Button(props: any) {
  return (
    <div>
      <button
        className=" border-2 border-black rounded-lg p-2 w-[50%]"
        disabled={props.isLoading}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    </div>
  );
}
