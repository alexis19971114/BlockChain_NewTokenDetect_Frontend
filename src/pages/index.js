
import styles from '@/styles/Home.module.css'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { useRouter } from 'next/router';
import { SET_WORDS, SET_CONTRACTS, SET_ORDER, SET_CHECK, SET_LOADING } from '../../redux/reducers/sniperSlice'
import { socket } from './socket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Tooltip, notification, Input, Checkbox } from "antd";
import Loading from './components/loading'

const { Search } = Input;

import dynamic from 'next/dynamic'
 
const Clock = dynamic(() => import('./components/clock'), { ssr: false })

import { convertTimezone } from './utils/timezone';

const Home = () => {

  const { words, contracts, order, loading, check }  = useSelector((state) => state.sniper)
  const dispatch                              = useDispatch()

  const router                                = useRouter()

  const [tokens, setTokens]                   = useState([''])
  

  let flag        = false

  useEffect(( ) => {
    getTokens(contracts, words, order)
  }, [order, contracts, check])

  useEffect(() => {
    if (flag) return
    flag = true
    dispatch(SET_LOADING(true))
      
    socket.on('clientConnected', (data) => {
      console.log(data)
      let { contracts, time } = data
      dispatch(SET_WORDS(""))
      dispatch(SET_CONTRACTS(contracts))  
    })
    socket.on('newContractCreated', (data) => {
      let { token, contracts } = data
      dispatch(SET_CONTRACTS(contracts))
      openNotification("New Contract Created", token.address, "success")
    })
    socket.on('newPairCreated', (data) => {
      let { token, contracts } = data
      dispatch(SET_CONTRACTS(contracts))
      openNotification("New Pair Created", token.pair, "info")
    })
    socket.on('swapEnabled', (data) => {
      let { token, contracts } = data
      dispatch(SET_CONTRACTS(contracts))
      openNotification("Swap Enabled", `The first sniper attack is done to: ${token.address}`, "warning")
    })
    socket.on('sniperAttack', (data) => {
      let { token, contracts } = data
      dispatch(SET_CONTRACTS(contracts))
      openNotification("Continuous Sniper Attack!!!", `The several sniper attacks are happening to: ${token.address}`, "error")
      dispatch(SET_WORDS(token.pair))
    })

  }, [flag])

  const sortContracts = (contracts, order) => {
    let oldContracts = [...contracts]
    let newContracts = []
    newContracts = oldContracts.sort((a, b) => {
      switch(order.status) {
        case "createdat":
          if (a.createdAt === undefined && b.createdAt === undefined) return 0;
          if (a.createdAt === undefined) return order.inc ? -1 : 1
          if (b.createdAt === undefined) return order.inc ? 1 : -1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "updatedat":
          if (a.updatedAt === undefined && b.updatedAt === undefined) return 0;
          if (a.updatedAt === undefined) return order.inc ? -1 : 1
          if (b.updatedAt === undefined) return order.inc ? 1 : -1
          if (a.updatedAt > b.updatedAt) return order.inc ? 1 : -1
          if (a.updatedAt < b.updatedAt) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "sniped":
          if (a.firstBlockBuyCount === undefined && b.firstBlockBuyCount === undefined) return 0;
          if (a.firstBlockBuyCount === undefined) return order.inc ? -1 : 1
          if (b.firstBlockBuyCount === undefined) return order.inc ? 1 : -1
          if (a.firstBlockBuyCount > b.firstBlockBuyCount) return order.inc ? 1 : -1
          if (a.firstBlockBuyCount < b.firstBlockBuyCount) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "sniped-n":
          if (a.nonceCount === undefined && b.nonceCount === undefined) return 0;
          if (a.nonceCount === undefined) return order.inc ? -1 : 1
          if (b.nonceCount === undefined) return order.inc ? 1 : -1
          if (a.nonceCount > b.nonceCount) return order.inc ? 1 : -1
          if (a.nonceCount < b.nonceCount) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "buy":
          if (a.buyCount === undefined && b.buyCount === undefined) return 0;
          if (a.buyCount === undefined) return order.inc ? -1 : 1
          if (b.buyCount === undefined) return order.inc ? 1 : -1
          if (a.buyCount > b.buyCount) return order.inc ? 1 : -1
          if (a.buyCount < b.buyCount) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "sell":
          if (a.sellCount === undefined && b.sellCount === undefined) return 0;
          if (a.sellCount === undefined) return order.inc ? -1 : 1
          if (b.sellCount === undefined) return order.inc ? 1 : -1
          if (a.sellCount > b.sellCount) return order.inc ? 1 : -1
          if (a.sellCount < b.sellCount) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        case "blockNumber":
          if (a.blockNumber === undefined && b.blockNumber === undefined) return 0;
          if (a.blockNumber === undefined) return order.inc ? -1 : 1
          if (b.blockNumber === undefined) return order.inc ? 1 : -1
          if (a.blockNumber > b.blockNumber) return order.inc ? 1 : -1
          if (a.blockNumber < b.blockNumber) return order.inc ? -1 : 1
          if (a.createdAt > b.createdAt) return order.inc ? 1 : -1
          if (a.createdAt < b.createdAt) return order.inc ? -1 : 1
          return 0
        default:
          return 0
      }
    })
    return newContracts
  }

  const openNotification = (title, content, status = '') => {
    const data = {
      message: title,
      description: content,
      style: {
        width: 600,
      },
      duration: 2,
      placement: 'bottomLeft'
    }
    
    switch(status) {
      case "success":
        notification.success(data);
        break;
      case "info":
        notification.info(data);
        break;
      case "warning":
        notification.warning(data);
        break;
      case "error":
        notification.error(data);
        break;
      default:
        notification.open(data);
        break;
    }
  };

  const getTokens = (contracts, words = "", order) => {
    let filterContracts = contracts.filter((contract) => {
      if(!contract) return false;
      const criteria = contract.firstBlockBuyCount ? contract.firstBlockBuyCount : 0
      if(check.sniped && criteria < 1) return false;
      if(check.unsniped && criteria >= 1) return false;
      if(check.nonce && contract.nonceCount < 1) return false;
      if(check.profitable) {
        if(contract.nonceCount < 5) return false;
        if(contract.buyCount + contract.sellCount < 50) return false;
        if(contract.sellCount < 5) return false;
      }

      let flag = true;
      for(let word of words.split(" ")) {
        word = word.toLowerCase();
        let smallFlg = false;
        if (contract.address.toLowerCase().includes(word))  smallFlg = true;
        if (contract.owner.toLowerCase().includes(word))    smallFlg = true;
        if (contract.pair.toLowerCase().includes(word))     smallFlg = true;
        if (contract.name.toLowerCase().includes(word))     smallFlg = true;
        if (contract.symbol.toLowerCase().includes(word))   smallFlg = true;
        if (!smallFlg) {
          flag = false;
          break;
        }
      }
      return flag;
    })
    let orderContracts = sortContracts(filterContracts, order)
    setTokens(orderContracts)
    dispatch(SET_LOADING(false))
  }

  const onChange = (e) => {
    dispatch(SET_WORDS(e.target.value))
    getTokens(contracts, e.target.value, order)
  }

  const copyBtnClicked = (e, value) => {
    navigator.clipboard.writeText(value)
  }

  const isThisBtn = (list) => {
    for(const item of list) {
      if (item == "copy-btn") return true;
      if (item == "to-etherscan") return true;
    }
    return false;
  }

  const tokenClicked = (e, address) => {
    if(isThisBtn(e.target.classList)) return;
    console.log("token clicked", address)
    router.push('/token-page?address=' + address);  
  }

  const getLinkUrl = (address) => {
    return 'https://etherscan.io/address/' + address
  }

  const filterCheck = (filter) => {
    switch(filter) {
      case "sniped":
        dispatch(SET_CHECK({ sniped: !check.sniped }))
        break;
      case "unsniped":
        dispatch(SET_CHECK({ unsniped: !check.unsniped }))
        break;
      case "nonce":
        dispatch(SET_CHECK({ nonce: !check.nonce }))
        break;
      case "profitable":
        dispatch(SET_CHECK({ profitable: !check.profitable }))
        break;
      default:
    }
  }

  return (
    <>
      <main className={styles.main}>  
        { loading && <Loading/> }
        <div className='clock mt-3'>
          <Clock/>    
        </div> 
        <div className='d-flex justify-content-center align-items-center'>
          <div className='header d-flex my-2 justify-content-between'>
            <div className='filters d-flex align-items-center'>
              <Checkbox checked={check.nonce} onChange={() => filterCheck("nonce")}>
                Sniped-N
              </Checkbox>
              <Checkbox checked={check.sniped} onChange={() => filterCheck("sniped")}>
                Sniped
              </Checkbox>
              <Checkbox checked={check.unsniped} onChange={() => filterCheck("unsniped")}>
                Unsniped
              </Checkbox>
              <Checkbox checked={check.profitable} onChange={() => filterCheck("profitable")}>
                Profitable
              </Checkbox>
            </div>
            <div className='d-flex'>
              <Link className='mx-1 d-flex align-items-center' href="https://etherscan.io/address/0xea7be26ca20e55d4783ffe0085cc604b996749e5">
                Etherscan
              </Link>
              <Link className='mx-1 d-flex align-items-center' href="https://coinmarketcap.com/currencies/dextools/">
                Coin Market
              </Link>
              <Link className='mx-1 d-flex align-items-center' href="https://www.coingecko.com/en/coins/dextools">
                Coin Gekco
              </Link>
              <Link className='mx-1 d-flex align-items-center' href="https://www.coinbase.com/">
                Coinbase
              </Link>
              <Link className='mx-1 d-flex align-items-center' href="https://www.blockchain.com/">
                Blockchain
              </Link>
              <Link className='mx-1 d-flex align-items-center' href="https://uniswap.org/">
                Uniswap
              </Link>
            </div> 
            <div className='search-bar'>
              <Search
                placeholder="Search for tokens"
                allowClear
                size="large"
                onChange={onChange} 
                value={words}
                enterButton
              />
            </div> 
            <h5 className='d-flex align-items-center my-0 ms-2'>{tokens.length} searched</h5>  
            </div>
        </div>
        <div className='sniper-table'>
          <table className="table-dark m-3">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Name(Symbol)</th>
                <th scope="col">Address</th>
                <th scope="col">Address</th>
                <th scope="col">Address</th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "createdat", inc: 0}))}>Created at <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "updatedat", inc: 0}))}>Updated at <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "sniped", inc: 0}))}>Sniped <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "sniped-n", inc: 0}))}>Sniped-N <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "buy", inc: 0}))}>Buy <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "sell", inc: 0}))}>Sell <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "blockNumber", inc: 0}))}>Block No <FontAwesomeIcon icon={faSort} /></th>
              </tr>
            </thead>
            <tbody>
              {
                tokens.map((token, index) => {  
                  if(!token) return;

                  return <tr onClick={(e) => tokenClicked(e, token.address)} key={index} className='my-3 token-tr'>
                    <th scope='row'>{index + 1}</th>
                    <td><p>{token.name.slice(0, Math.min(15, token.name.length))}</p>({token.symbol})</td>
                    <td>
                      {
                        token.owner && <div className='d-flex justify-content-between align-items-center'>
                          <Link className='to-etherscan' href={getLinkUrl(token.owner.toLowerCase())}>
                            {token.owner.toLowerCase().slice(0, 6) + "..." + token.owner.toLowerCase().slice(-4)}
                          </Link> 
                          <Tooltip placement="top" title={"Copied:" + token.owner.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.owner.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>
                      {
                        token.address && <div className='d-flex justify-content-between align-items-center'>
                          <Link className='to-etherscan' href={getLinkUrl(token.address.toLowerCase())}>
                            {token.address.toLowerCase().slice(0, 6) + "..." + token.address.toLowerCase().slice(-4)}
                          </Link> 
                          <Tooltip placement="top" title={"Copied:" + token.address.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.address.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>
                      {
                        token.pair && <div className='d-flex justify-content-between align-items-center'>
                          <Link className='to-etherscan' href={getLinkUrl(token.address.toLowerCase())}>
                            {token.pair.toLowerCase().slice(0, 6) + "..." + token.pair.toLowerCase().slice(-4)}
                          </Link>
                          <Tooltip placement="top" title={"Copied:" + token.pair.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.pair.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>{convertTimezone(token.createdAt)}</td>
                    <td>{convertTimezone(token.updatedAt)}</td>
                    <td>{token.firstBlockBuyCount ? token.firstBlockBuyCount : 0}</td>
                    <td>{token.nonceCount ? token.nonceCount : 0}</td>
                    <td>{token.buyCount ? token.buyCount : 0}</td>
                    <td>{token.sellCount ? token.sellCount : 0}</td>
                    <td>{token.blockNumber ? token.blockNumber : ""}</td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>
        
        <style jsx global>{`

          body {
            margin: 0;
            padding: 0;
            background-color: black;
            min-height: 100vh;
          }
          .sniper-table {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          p {
            margin: 0;
            padding: 0;
          }
          .header {
            width: 80%;
          }
          .filters {
            span {
              color: white;
            }
          }
          table {
            width:90%;
          }
          button {
            margin: 0;
            padding: 0;
          }
          td {
            padding: 1vw;
            margin: 0;
          }
          th {
            padding: 1vw 0.5vw;
            &.sortTh:hover {
              cursor: pointer;
              background-color: #181818;      
            } 
          }
          .search-bar {
            text-align: center;
          
            width: 30%;
            .ant-input-group-wrapper {
              width: 100%
            }
            .ant-input-affix-wrapper {
              border-radius: 5px !important;
              background-color: black;
              color: white;
            }
            input::placeholder {
              color: grey;
            }
            border: grey;
            .ant-input-clear-icon {
              font-size: 1vw;
              color: grey;
            }
            .ant-input-group-addon {
              display:none;
            }
          }
          .token-tr:hover {
            cursor: pointer;
            background-color: #181818;
          }
          .clock {
            width: 200px;
            max-width: 200px;
          }
          .to-etherscan {
            color: #1677ff;
            padding: 1vw 0;
            text-decoration: none;
            &:hover {
              text-decoration: underline;
            }
          }
        `}
        </style>
      </main>
    </>
  )
}

export default Home