import './App.css'
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

function App() {
  const contractAddress = "0x6BB6dFa3d9886112df92d645A9A0CAF6F873cA22";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        // const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(Number(wave.timestamp) * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", Number(count));

        const waveTxn = await wavePortalContract.wave("Hey hey hey!!!");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", Number(count));

        await getAllWaves()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    findMetaMaskAccount().then(async (account) => {
      if (account !== null) {
        setCurrentAccount(account);
        await getAllWaves();
      }
    });
  }, []);

  return (
    <>
    <div className='container'>
      <h1 className='title'>Feedback DApp</h1>
      {
        currentAccount ? 
          (<div>Welcome {currentAccount}</div>) 
          : 
          (<button className='connect-wallet-btn' onClick={connectWallet} >Connect Wallet</button>)
      }
      <form>
        <div>
          <label htmlFor="feedbackMessage">Feedback Message:</label>
          <textarea id="feedback" name="feedbackMessage" rows="4" required></textarea>
        </div>
        <div onClick={wave}>wave</div>
        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
      {allWaves.map((wave, index) => {
        return (
          <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message: {wave.message}</div>
          </div>)
      })}
      </div>
    </>
  )
}

export default App
