import {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import './App.css'
import {VeraxSdk} from "@verax-attestation-registry/verax-sdk";
import {useAccount} from "wagmi";
import ConnectButton from "./components/ConnectButton.tsx";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import {waitForTransactionReceipt} from "viem/actions";
import {Hex, isAddress} from "viem";
import {wagmiConfig} from "./wagmiConfig.ts";

function App() {
    const [inputValues, setInputValues] = useState({monitoredContractAddress: '', monitoringLevel: '', dAppName: '', expiryDate: ''});
    const [errors, setErrors] = useState({monitoredContractAddress: '', monitoringLevel: '', dAppName: '', expiryDate: ''});
    const [veraxSdk, setVeraxSdk] = useState<VeraxSdk>();
    const [txHash, setTxHash] = useState<Hex>();
    const [attestationId, setAttestationId] = useState<Hex>();

    const {address, chainId} = useAccount();

    const schemaId = "0x4495ace11dc84fb96437f8fa7f07244a357ea29ca28e2bd71ca6fb826265b216"
    const portalId = "0x59C28FB3240Af0fB209A1Ac848f5cab387585106"

    useEffect(() => {
        if (chainId && address) {
            const sdkConf =
                chainId === 59144 ? VeraxSdk.DEFAULT_LINEA_MAINNET_FRONTEND : VeraxSdk.DEFAULT_LINEA_SEPOLIA_FRONTEND;
            const sdk = new VeraxSdk(sdkConf, address);
            setVeraxSdk(sdk);
        }
    }, [chainId, address]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInputValues({ ...inputValues, [e.target.name]: e.target.value });
        validateField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (Object.values(errors).every(error => error === '')) {
            setTxHash(undefined);
            setAttestationId(undefined);
            await issueAttestation();
        }
    };

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'monitoredContractAddress':
                if (!isAddress(value)) {
                    error = 'Monitored address is not a valid smart contract address.';
                }
                break;
            case 'monitoringLevel':
                if (value === '') {
                    error = 'Monitoring level is required.';
                }
                break;
            case 'dAppName':
                if (value === '') {
                    error = 'dApp name is required.';
                }
                break;
            default:
                break;
        }
        setErrors({...errors, [name]: error});
    };

    const issueAttestation = async () => {
        if (address && veraxSdk) {
            try {
                let expirationDate = inputValues.expiryDate 
                    ? Math.floor(new Date(inputValues.expiryDate).getTime() / 1000) 
                    : 0;
                let receipt = await veraxSdk.portal.attest(
                    portalId,
                    {
                        schemaId,
                        expirationDate,
                        subject: inputValues.monitoredContractAddress,
                        attestationData: [{
                            monLevel: 1,
                            dAppName: inputValues.dAppName,
                        }],
                    },
                    [],
                    false
                );
                if (receipt.transactionHash) {
                    setTxHash(receipt.transactionHash)
                    receipt = await waitForTransactionReceipt(wagmiConfig.getClient(), {
                        hash: receipt.transactionHash,
                    });
                    setAttestationId(receipt.logs?.[0].topics[1])
                } else {
                    alert(`Oops, something went wrong!`);
                }
            } catch (e) {
                console.log(e);
                if (e instanceof Error) {
                    alert(`Oops, something went wrong: ${e.message}`);
                }
            }
        }
    };

    const isError = () => {
        return errors.monitoredContractAddress !== '' || errors.monitoringLevel !== '' || errors.dAppName !== ''
    }

    const isEmpty = () => {
        return inputValues.monitoredContractAddress === '' || inputValues.monitoringLevel === '' || inputValues.dAppName === ''
    }

    const truncateHexString = (hexString: string) => {
        return `${hexString.slice(0, 7)}...${hexString.slice(hexString.length - 5, hexString.length)}`
    }

    return (
        <>
            <Header/>
            <div className={'main-container'}>
                <ConnectButton/>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label htmlFor="monitoredContractAddress">Monitored Contract Address:</label>
                        <input type="text" name="monitoredContractAddress" value={inputValues.monitoredContractAddress} onChange={handleChange} />
                    {errors.monitoredContractAddress && <div className="error">{errors.monitoredContractAddress}</div>}
                    </div>
                    <div className="input-container">
                        <label htmlFor="monitoringLevel">Monitoring Level:</label>
                        <select name="monitoringLevel" value={inputValues.monitoringLevel} onChange={handleChange}>
                            <option value="">Select monitoring level</option>
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                        </select>
                    {errors.monitoringLevel && <div className="error">{errors.monitoringLevel}</div>}
                    </div>
                    <div className="input-container">
                        <label htmlFor="dAppName">dApp Name:</label>
                        <input type="text" name="dAppName" value={inputValues.dAppName} onChange={handleChange} />
                    {errors.dAppName && <div className="error">{errors.dAppName}</div>}
                    </div>
                    <div className="input-container">
                        <label htmlFor="expiryDate">Expiry Date:</label>
                        <input type="date" name="expiryDate" value={inputValues.expiryDate} onChange={handleChange} />
                    </div>
                    <button type="submit" disabled={!address || !veraxSdk || isError() || isEmpty()}>Issue attestation</button>
                </form>
                {txHash && <div className={'message'}>Transaction Hash: <a
                  href={`${chainId === 59144 ? 'https://lineascan.build/tx/' : 'https://sepolia.lineascan.build/tx/'}${txHash}`}
                  target="_blank" rel="noopener noreferrer">{truncateHexString(txHash)}</a></div>}
                {txHash && !attestationId && <div className={'message pending'}>Transaction pending...</div>}
                {attestationId && <div className={'message success'}>Attestation ID: <a
                  href={`${chainId === 59144 ? 'https://explorer.ver.ax/linea/attestations/' : 'https://explorer.ver.ax/linea-sepolia/attestations/'}${attestationId}`}
                  target="_blank" rel="noopener noreferrer">{truncateHexString(attestationId)}</a></div>}
            </div>
            <Footer/>
        </>
    );
}

export default App
