import { useRouter } from 'next/router';
import { useState, useEffect } from'react';
import axios from 'axios';
import { Tooltip } from "antd";
import { convertTimezone } from '../utils/timezone';

const newPage = () => {
  const router = useRouter()
  const { address }= router.query
  //const address = "0xd3db5dda1e6c171ce36d04f2b58c59416bb7ed0f"

  const [data, setData] = useState(null);
  const [sniperTx, setSniperTx] = useState(null);
  
  const SNIPERS = {
    BANANA_GUN: "0x3328F7f4A1D1C57c35df56bBf0c9dCAFCA309C49".toLocaleLowerCase(),
    UNIV2_ROUTER: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d".toLocaleLowerCase(),
    MAESTRO: "0x80a64c6D7f12C47B7c66c5B4E20E72bc1FCd5d9e".toLocaleLowerCase()
  }
 
  useEffect(() => {
    const fetchApiData = async (address) => {
      try {
        const result = await axios.get(`http://135.181.0.186:83/api/v1/contractInfo/?address=${address}`)
        setData(result.data.data);
        setSniperTx(result.data.sniperTxs);
      } catch (err) {
        console.log(err)
      }
    };

    if(address != undefined) fetchApiData(address);

  }, [])

  const copyBtnClicked = (value) => {
    navigator.clipboard.writeText(getAddress(value))
  }

  const getAddress = (value) => {
    switch(value) {
      case "bananagun":
        value = "0x3328F7f4A1D1C57c35df56bBf0c9dCAFCA309C49".toLocaleLowerCase()
        break;
      case "uniswapv2router":
        value = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d".toLocaleLowerCase()
        break;
      case "maestro":
        value = "0x80a64c6D7f12C47B7c66c5B4E20E72bc1FCd5d9e".toLocaleLowerCase()
        break;
    }
    return value;
  }
  
  return (
    <div className='mx-5 pb-5 mt-4'>
      <div className='text-center mb-5'>
        <h1>Token Information</h1>
      </div>
      <div className='d-flex'>
        <div className='json-part'>
          <h2>Json Data</h2>
          {
            data && (
              <pre>{JSON.stringify(data, null, 2)}</pre>
            )
          }
          {
            sniperTx && (
              <pre>{JSON.stringify(sniperTx, null, 2)}</pre>
            )
          }
        </div>
        <div className='table-data ms-5'>
          <h2>Table Data</h2>
          {
            data && (
              <table className="table-dark mt-3">
                <thead className='py-3'>
                  <tr className='text-center'>
                    <th scope="col"><h5>Property</h5></th>
                    <th scope="col"><h5>Value</h5></th>
                  </tr>
                </thead>
                <tbody className=''>
                  <tr>
                    <td>Address</td>
                    <td>{data.address}</td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{data.name}</td>
                  </tr>
                  <tr>
                    <td>Symbol</td>
                    <td>{data.symbol}</td>
                  </tr>
                  <tr>
                    <td>Owner</td>
                    <td>{data.owner}</td>
                  </tr>
                  <tr>
                    <td>Total Supply</td>
                    <td>{data.totalSupply}</td>
                  </tr>
                  <tr>
                    <td>Token Creation Hash</td>
                    <td>{data.tokenCreationHash}</td>
                  </tr>
                  <tr>
                    <td>Block Number</td>
                    <td>{data.blockNumber}</td>
                  </tr>
                  {/* <tr>
                    <td>Contract Source Code</td>
                    <td>{data.contractSourceCode}</td>
                  </tr> */}
                  <tr>
                    <td>Level</td>
                    <td>{data.level}</td>
                  </tr>
                  <tr>
                    <td>Created At</td>
                    <td>{convertTimezone(data.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>Updated At</td>
                    <td>{convertTimezone(data.updatedAt)}</td>
                  </tr>
                  <tr>
                    <td>Pair</td>
                    <td>{data.pair}</td>
                  </tr>
                  <tr>
                    <td>Pair Token</td>
                    <td>{data.pairToken}</td>
                  </tr>
                  <tr>
                    <td>Buy Count</td>
                    <td>{data.buyCount}</td>
                  </tr>
                  <tr>
                    <td>Sell Count</td>
                    <td>{data.sellCount}</td>
                  </tr>
                  <tr>
                    <td>Sniper Attack(Buy)</td>
                    <td>{data.firstBlockBuyCount}</td>
                  </tr>
                  <tr>
                    <td>Sniper Attack(Sell)</td>
                    <td>{data.firstBlockSellCount}</td>
                  </tr>
                  <tr>
                    <td>Sniper Block</td>
                    <td>{data.firstSwapBlockNumber}</td>
                  </tr>
                  <tr>
                    <td>Max Trade Amount</td>
                    <td>{data.maxTradeTokenAmount}</td>
                  </tr>
                </tbody>
              </table>
            )
          }
          <div>
          <h2 className='mt-5'>
            <span>Sniper Attack</span>
            {
              sniperTx && 
              <span className='small-title ms-2'>
                ( BananaGun: {sniperTx.BGCount + "  "}  
                Mastro: {sniperTx.MaestroCount} )
              </span>
            }
          </h2>
          {
            sniperTx && sniperTx.sniperTxs.length > 0 && (
              <table className="table-dark mb-5">
                <thead className='py-3'>
                  <tr className='text-center'>
                    <th scope="col"><h5>From(Account)</h5></th>
                    <th scope="col"><h5>To(Contract)</h5></th>
                    <th scope="col"><h5>Nonce</h5></th>
                    <th scope="col"><h5>Priority Fee</h5></th>
                    <th scope="col"><h5>Gas Limit</h5></th>
                    <th scope="col"><h5>Value(ETH)</h5></th>
                    <th scope="col"><h5>Tx Hash</h5></th>
                  </tr>
                </thead>
                <tbody className=''>
                  {
                    (sniperTx.sniperTxs).map((tx, index) => {  
                      return (
                        <tr key={index}>
                          <td>
                            <div className='d-flex justify-content-between align-items-center'>
                              {tx.from.slice(0, Math.min(10, tx.from.length))}...
                              <Tooltip placement="top" title={"Copied:" + tx.from.toLowerCase()} trigger={"click"}>
                                <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(tx.from.toLowerCase())}>C</button>
                              </Tooltip>
                            </div>
                          </td>
                          <td>
                            <div className='d-flex justify-content-between align-items-center'>
                              {tx.to.slice(0, Math.min(10, tx.to.length))}{tx.to.length > 20 && "..."}
                              <Tooltip placement="top" title={"Copied:" + getAddress(tx.to.toLowerCase())} trigger={"click"}>
                                <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(tx.to.toLowerCase())}>C</button>
                              </Tooltip>
                            </div>
                          </td>
                          <td>{tx.nonce}</td>
                          <td>{tx.priorityFee}</td>
                          <td>{tx.gasLimit}</td>
                          <td>{tx.value}</td>
                          <td>{tx.txHash.slice(0, Math.min(10, tx.txHash.length))}...</td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            )
          }
        </div>
        </div>
      </div>
      
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          min-height: 100vh;
          color: white;
        }
        td {
          padding: 5px 10px;
        }
        .small-title {
          font-size: 1.3rem;
        }
        th {
          padding: 5px 10px;
        }
        .json-part {
          width: 40%;
        }
        `}
      </style>
    </div>
  );
}

export default newPage;