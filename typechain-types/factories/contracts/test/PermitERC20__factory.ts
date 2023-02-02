/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  PermitERC20,
  PermitERC20Interface,
} from "../../../contracts/test/PermitERC20";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6101406040523480156200001257600080fd5b506040518060400160405280600b81526020016a05065726d697445524332360ac1b81525080604051806040016040528060018152602001603160f81b8152506040518060400160405280600481526020016315195cdd60e21b815250604051806040016040528060038152602001621514d560ea1b81525081600390816200009c9190620002db565b506004620000ab8282620002db565b5050825160209384012082519284019290922060e08390526101008190524660a0818152604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f818901819052818301979097526060810194909452608080850193909352308483018190528151808603909301835260c094850190915281519190960120905292909252610120525062000166905033620001526012600a620004bc565b62000160906103e8620004d4565b6200016c565b62000504565b6001600160a01b038216620001c75760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640160405180910390fd5b8060026000828254620001db9190620004ee565b90915550506001600160a01b038216600081815260208181526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b505050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200026257607f821691505b6020821081036200028357634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200023257600081815260208120601f850160051c81016020861015620002b25750805b601f850160051c820191505b81811015620002d357828155600101620002be565b505050505050565b81516001600160401b03811115620002f757620002f762000237565b6200030f816200030884546200024d565b8462000289565b602080601f8311600181146200034757600084156200032e5750858301515b600019600386901b1c1916600185901b178555620002d3565b600085815260208120601f198616915b82811015620003785788860151825594840194600190910190840162000357565b5085821015620003975787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115620003fe578160001904821115620003e257620003e2620003a7565b80851615620003f057918102915b93841c9390800290620003c2565b509250929050565b6000826200041757506001620004b6565b816200042657506000620004b6565b81600181146200043f57600281146200044a576200046a565b6001915050620004b6565b60ff8411156200045e576200045e620003a7565b50506001821b620004b6565b5060208310610133831016604e8410600b84101617156200048f575081810a620004b6565b6200049b8383620003bd565b8060001904821115620004b257620004b2620003a7565b0290505b92915050565b6000620004cd60ff84168362000406565b9392505050565b8082028115828204841417620004b657620004b6620003a7565b80820180821115620004b657620004b6620003a7565b60805160a05160c05160e05161010051610120516112a0620005546000396000610be901526000610c3801526000610c1301526000610b6c01526000610b9601526000610bc001526112a06000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806370a082311161008c578063a457c2d711610066578063a457c2d7146101d0578063a9059cbb146101e3578063d505accf146101f6578063dd62ed3e1461020b57600080fd5b806370a082311461017f5780637ecebe00146101b557806395d89b41146101c857600080fd5b806323b872dd116100c857806323b872dd14610142578063313ce567146101555780633644e51514610164578063395093511461016c57600080fd5b806306fdde03146100ef578063095ea7b31461010d57806318160ddd14610130575b600080fd5b6100f7610251565b6040516101049190610ff1565b60405180910390f35b61012061011b366004611086565b6102e3565b6040519015158152602001610104565b6002545b604051908152602001610104565b6101206101503660046110b0565b6102fd565b60405160128152602001610104565b610134610321565b61012061017a366004611086565b610330565b61013461018d3660046110ec565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6101346101c33660046110ec565b61037c565b6100f76103a7565b6101206101de366004611086565b6103b6565b6101206101f1366004611086565b61048c565b61020961020436600461110e565b61049a565b005b610134610219366004611181565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b606060038054610260906111b4565b80601f016020809104026020016040519081016040528092919081815260200182805461028c906111b4565b80156102d95780601f106102ae576101008083540402835291602001916102d9565b820191906000526020600020905b8154815290600101906020018083116102bc57829003601f168201915b5050505050905090565b6000336102f1818585610659565b60019150505b92915050565b60003361030b85828561080c565b6103168585856108e3565b506001949350505050565b600061032b610b52565b905090565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff871684529091528120549091906102f19082908690610377908790611201565b610659565b73ffffffffffffffffffffffffffffffffffffffff81166000908152600560205260408120546102f7565b606060048054610260906111b4565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff871684529091528120549091908381101561047f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6103168286868403610659565b6000336102f18185856108e3565b83421115610504576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606401610476565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886105338c610c86565b60408051602081019690965273ffffffffffffffffffffffffffffffffffffffff94851690860152929091166060840152608083015260a082015260c0810186905260e001604051602081830303815290604052805190602001209050600061059b82610cbb565b905060006105ab82878787610d24565b90508973ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610642576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152606401610476565b61064d8a8a8a610659565b50505050505050505050565b73ffffffffffffffffffffffffffffffffffffffff83166106fb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610476565b73ffffffffffffffffffffffffffffffffffffffff821661079e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f73730000000000000000000000000000000000000000000000000000000000006064820152608401610476565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146108dd57818110156108d0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610476565b6108dd8484848403610659565b50505050565b73ffffffffffffffffffffffffffffffffffffffff8316610986576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610476565b73ffffffffffffffffffffffffffffffffffffffff8216610a29576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f65737300000000000000000000000000000000000000000000000000000000006064820152608401610476565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610adf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610476565b73ffffffffffffffffffffffffffffffffffffffff848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a36108dd565b60003073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016148015610bb857507f000000000000000000000000000000000000000000000000000000000000000046145b15610be257507f000000000000000000000000000000000000000000000000000000000000000090565b50604080517f00000000000000000000000000000000000000000000000000000000000000006020808301919091527f0000000000000000000000000000000000000000000000000000000000000000828401527f000000000000000000000000000000000000000000000000000000000000000060608301524660808301523060a0808401919091528351808403909101815260c0909201909252805191012090565b73ffffffffffffffffffffffffffffffffffffffff811660009081526005602052604090208054600181018255905b50919050565b60006102f7610cc8610b52565b836040517f19010000000000000000000000000000000000000000000000000000000000006020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b6000806000610d3587878787610d4c565b91509150610d4281610e3b565b5095945050505050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610d835750600090506003610e32565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610dd7573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff8116610e2b57600060019250925050610e32565b9150600090505b94509492505050565b6000816004811115610e4f57610e4f61123b565b03610e575750565b6001816004811115610e6b57610e6b61123b565b03610ed2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610476565b6002816004811115610ee657610ee661123b565b03610f4d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610476565b6003816004811115610f6157610f6161123b565b03610fee576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c60448201527f75650000000000000000000000000000000000000000000000000000000000006064820152608401610476565b50565b600060208083528351808285015260005b8181101561101e57858101830151858201604001528201611002565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8301168501019250505092915050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461108157600080fd5b919050565b6000806040838503121561109957600080fd5b6110a28361105d565b946020939093013593505050565b6000806000606084860312156110c557600080fd5b6110ce8461105d565b92506110dc6020850161105d565b9150604084013590509250925092565b6000602082840312156110fe57600080fd5b6111078261105d565b9392505050565b600080600080600080600060e0888a03121561112957600080fd5b6111328861105d565b96506111406020890161105d565b95506040880135945060608801359350608088013560ff8116811461116457600080fd5b9699959850939692959460a0840135945060c09093013592915050565b6000806040838503121561119457600080fd5b61119d8361105d565b91506111ab6020840161105d565b90509250929050565b600181811c908216806111c857607f821691505b602082108103610cb5577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b808201808211156102f7577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fdfea26469706673582212201eb3b2f1327598b743e75a25fc4a85f1a95440364fbd41a3c168fdf817f3255f64736f6c63430008110033";

type PermitERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PermitERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PermitERC20__factory extends ContractFactory {
  constructor(...args: PermitERC20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PermitERC20> {
    return super.deploy(overrides || {}) as Promise<PermitERC20>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PermitERC20 {
    return super.attach(address) as PermitERC20;
  }
  override connect(signer: Signer): PermitERC20__factory {
    return super.connect(signer) as PermitERC20__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PermitERC20Interface {
    return new utils.Interface(_abi) as PermitERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PermitERC20 {
    return new Contract(address, _abi, signerOrProvider) as PermitERC20;
  }
}