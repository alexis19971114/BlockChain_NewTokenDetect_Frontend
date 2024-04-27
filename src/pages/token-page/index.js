import { useRouter } from 'next/router';
import { useState, useEffect } from'react';
import { useSelector, useDispatch} from 'react-redux'
import axios from 'axios';
import { Tooltip, Spin } from "antd";
import { convertTimezone } from '../utils/timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faShare } from '@fortawesome/free-solid-svg-icons';
import { SET_ORDER2, SET_LOADING } from '../../../redux/reducers/sniperSlice'
import Loading from '../components/loading'
import Link from 'next/link';
import { SNIPERS } from '../utils/contants';
import { URLS } from '../utils/contants';

const newPage = () => {
  const router = useRouter()
  const { address }= router.query
  //const address = "0xd3db5dda1e6c171ce36d04f2b58c59416bb7ed0f"

  const { order2, loading }         = useSelector((state) => state.sniper)
  const dispatch                    = useDispatch()

  const [data, setData]             = useState(null);
  const [sniperTx, setSniperTx]     = useState(null);
  const [sniperTxs, setSniperTxs]   = useState([]);
  const [tab, setTab]               = useState("table");

  useEffect( () => {
    let orderTxs = sortTxs(sniperTxs, order2)
    setSniperTxs(orderTxs)
  }, [order2])

  useEffect(() => {
    if(sniperTx?.sniperTxs?.length > 0) {
      let orderTxs = sortTxs(sniperTx.sniperTxs, order2)
      setSniperTxs(orderTxs)
    }
  }, [sniperTx])

  const sortTxs = (txs, order) => {
    let oldTxs = [...txs]
    let newTxs = []
    newTxs = oldTxs.sort((a, b) => {
      switch(order.status) {
        case "nonce":
          if (a.nonce === undefined && b.nonce === undefined) return 0;
          if (a.nonce === undefined) return order.inc ? -1 : 1
          if (b.nonce === undefined) return order.inc ? 1 : -1
          if (a.nonce > b.nonce) return order.inc ? 1 : -1
          if (a.nonce < b.nonce) return order.inc ? -1 : 1
          return 0
        case "value":
          if (a.value === undefined && b.value === undefined) return 0;
          if (a.value === undefined) return order.inc ? -1 : 1
          if (b.value === undefined) return order.inc ? 1 : -1
          if (parseFloat(a.value) > parseFloat(b.value)) return order.inc ? 1 : -1
          if (parseFloat(a.value) < parseFloat(b.value)) return order.inc ? -1 : 1
          return 0
        case "priorityfee":
          if (a.priorityFee === undefined && b.priorityFee === undefined) return 0;
          if (a.priorityFee === undefined) return order.inc ? -1 : 1
          if (b.priorityFee === undefined) return order.inc ? 1 : -1
          if (parseFloat(a.priorityFee) > parseFloat(b.priorityFee)) return order.inc ? 1 : -1
          if (parseFloat(a.priorityFee) < parseFloat(b.priorityFee)) return order.inc ? -1 : 1
          return 0
        case "gaslimit":
          if (a.gasLimit === undefined && b.gasLimit === undefined) return 0;
          if (a.gasLimit === undefined) return order.inc ? -1 : 1
          if (b.gasLimit === undefined) return order.inc ? 1 : -1
          if (parseFloat(a.gasLimit) > parseFloat(b.gasLimit)) return order.inc ? 1 : -1
          if (parseFloat(a.gasLimit) < parseFloat(b.gasLimit)) return order.inc ? -1 : 1
          return 0
        default:
          return 0
      }
    })
    return newTxs
  }

  useEffect(() => {
    const fetchApiData = async (address) => {
      try {
        dispatch(SET_LOADING(true))
        const result = await axios.get(`${URLS.api}/?address=${address}`)
        setData(result.data.data);
        setSniperTx(result.data.sniperTxs);
        dispatch(SET_LOADING(false))
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
        value = SNIPERS.BANANA_GUN
        break;
      case "uniswapv2router":
        value = SNIPERS.UNIV2_ROUTER
        break;
      case "maestro":
        value = SNIPERS.MAESTRO
        break;
    }
    return value;
  }

  const getLinkUrl = (address, type="") => {
    if(type == "tx") return `${URLS.etherscan}/tx/${address}`
    return `${URLS.etherscan}/address/${getAddress(address)}`
  }

  const tabClick = (tab) => {
    if (tab == 'json') {
      document.getElementById('json-nav-item').className += " active"
      document.getElementById('table-nav-item').className = "nav-link nav-name"
    } else {
      document.getElementById('json-nav-item').className = "nav-link nav-name"
      document.getElementById('table-nav-item').className += " active"
    }
    setTab(tab)
  }
  
  return (
    <div className='mx-5 pb-5 mt-4'>
      { loading && <Loading/> }
      <div className='text-center to-main'>
        <Link href="/">
          <FontAwesomeIcon icon={faShare}/> Main
        </Link>
      </div>
      
      <div className='text-center mb-5'>
        <h1>Token Information</h1>
      </div>
      <div className='d-flex justify-content-center'>
        <ul className="nav nav-tabs w-75">
          <li className="nav-item" onClick={() => tabClick("table")}>
            <p className="nav-link nav-name active" id="table-nav-item">Table</p>
          </li>
          <li className="nav-item" onClick={() => tabClick("json")}>
            <p className="nav-link nav-name" id="json-nav-item">Json</p>
          </li>
        </ul>
      </div>
      <div className='d-flex justify-content-center'>
        {
          tab == "table" && (
            <div className='table-data'>
              <div className='d-flex justify-content-center mt-4'>
                <h2>Table Data</h2>
              </div>
              {
                data && (
                  <div className='d-flex justify-content-center mt-4'>
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
                          <td>
                            <Link className='to-etherscan' href={getLinkUrl(data.address.toLowerCase())}>
                              {data.address}
                            </Link>
                            <Tooltip placement="top" title={"Copied:" + data.address.toLowerCase()} trigger={"click"}>
                              <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(data.address.toLowerCase())}>C</button>
                            </Tooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>Pair</td>
                          <td>
                            <Link className='to-etherscan' href={getLinkUrl(data.pair.toLowerCase())}>
                              {data.pair}
                            </Link>
                            <Tooltip placement="top" title={"Copied:" + data.pair.toLowerCase()} trigger={"click"}>
                              <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(data.pair.toLowerCase())}>C</button>
                            </Tooltip>
                          </td>
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
                          <td>
                            <Link className='to-etherscan' href={getLinkUrl(data.owner.toLowerCase())}>
                              {data.owner}
                            </Link>
                            <Tooltip placement="top" title={"Copied:" + data.owner.toLowerCase()} trigger={"click"}>
                              <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(data.owner.toLowerCase())}>C</button>
                            </Tooltip>
                          </td>
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
                          <td>Pair Token</td>
                          <td>
                            <Link className='to-etherscan' href={getLinkUrl(data.pairToken.toLowerCase())}>
                              {data.pairToken}
                            </Link>
                            <Tooltip placement="top" title={"Copied:" + data.pairToken.toLowerCase()} trigger={"click"}>
                              <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(data.pairToken.toLowerCase())}>C</button>
                            </Tooltip>
                          </td>
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
                          <td>Nonce Attack(Buy)</td>
                          <td>{data.nonceCount}</td>
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
                  </div>
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
                  sniperTxs?.length > 0 && (
                    <table className="table-dark mb-5">
                      <thead className='py-3'>
                        <tr className='text-center'>
                          <th scope="col"><h5>From(Account)</h5></th>
                          <th scope="col"><h5>To(Contract)</h5></th>
                          <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER2({status: "nonce", inc: 1}))}>Nonce <FontAwesomeIcon icon={faSort} /></th>
                          <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER2({status: "priorityfee", inc: 0}))}>Priority Fee <FontAwesomeIcon icon={faSort} /></th>
                          <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER2({status: "gaslimit", inc: 0}))}>Gas Limit <FontAwesomeIcon icon={faSort} /></th>
                          <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER2({status: "value", inc: 0}))}>Value(ETH) <FontAwesomeIcon icon={faSort} /></th>
                          <th scope="col"><h5>Tx Hash</h5></th>
                        </tr>
                      </thead>
                      <tbody className=''>
                        {
                          (sniperTxs).map((tx, index) => {  
                            return (
                              <tr key={index}>
                                <td>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <Link className='to-etherscan' href={getLinkUrl(tx.from.toLowerCase())}>
                                      {tx.from.slice(0, Math.min(10, tx.from.length))}...
                                    </Link>
                                    <Tooltip placement="top" title={"Copied:" + tx.from.toLowerCase()} trigger={"click"}>
                                      <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(tx.from.toLowerCase())}>C</button>
                                    </Tooltip>
                                  </div>
                                </td>
                                <td>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <Link className='to-etherscan' href={getLinkUrl(tx.to.toLowerCase())}>
                                      {tx.to.slice(0, Math.min(10, tx.to.length))}{tx.to.length > 20 && "..."}
                                    </Link>
                                    <Tooltip placement="top" title={"Copied:" + getAddress(tx.to.toLowerCase())} trigger={"click"}>
                                      <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(tx.to.toLowerCase())}>C</button>
                                    </Tooltip>
                                  </div>
                                </td>
                                <td>{tx.nonce}</td>
                                <td>{tx.priorityFee}</td>
                                <td>{tx.gasLimit}</td>
                                <td>{tx.value}</td>
                                <td>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <Link className='to-etherscan' href={getLinkUrl(tx.txHash.toLowerCase(), "tx")}>
                                      {tx.txHash.slice(0, Math.min(10, tx.txHash.length))}...
                                    </Link>
                                    <Tooltip placement="top" title={"Copied:" + getAddress(tx.txHash.toLowerCase())} trigger={"click"}>
                                      <button className='copy-btn btn btn-dark ms-2' onClick={() => copyBtnClicked(tx.txHash.toLowerCase())}>C</button>
                                    </Tooltip>
                                  </div>
                                </td>
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
          )
        }
        {
          tab == "json" && (
            <div className='json-part'>
              <div className='d-flex justify-content-center mt-4'>
                <h2>Json Data</h2>
              </div>
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
          )
        }
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
          &.sortTh:hover {
            cursor: pointer;
            background-color: #181818;      
          }
        }
        .json-part {
          width: 75%;
        }
        .table-part {
          width: 75%;
        }
        .to-main {
          position: fixed;
          top: 10vh;
          right: 0px;
          a {
            color: white;
            text-decoration: none;
            border: 2px solid grey;
            padding: 1vw;
            border-radius: 100vw 0 0 100vw;
            font-size: 1vw;
            &:hover {
              border: 2px solid white;
              background-color: grey;
            }
          }
        }
        .to-etherscan {
          color: #1677ff;
          padding: 1vw 0;
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
        .nav-name {
          color: white;
          padding: 0.5vw 2vw;
          font-size: 1vw;
          &.active {
            color: white !important;
            background-color: #181818 !important;
          }
          &:hover {
            background-color: #181818;
            color: white;
            cursor: pointer;
          }
        }
        `}
      </style>
    </div>
  );
}

export default newPage;