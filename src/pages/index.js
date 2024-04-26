
import styles from '@/styles/Home.module.css'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { useRouter } from 'next/router';
import { SET_WORDS, SET_CONTRACTS, SET_ORDER } from '../../redux/reducers/sniperSlice'
import { socket } from './socket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, notification, Input } from "antd";
const { Search } = Input;

import Clock from './components/clock';
import { convertTimezone } from './utils/timezone';

// function DisplayName(){
//   const { name } = useSelector((state) => state.sniper)

//   return (
//     <h1> I am {name} !!</h1> 
//   ) 
// }


const Home = () => {

  const { words, contracts, order } = useSelector((state) => state.sniper)
  const dispatch                    = useDispatch()

  const router                      = useRouter()

  const [tokens, setTokens]         = useState([''])
  
  // const inputName = useRef()
  let flag        = false

  useEffect(() => {
    getTokens(contracts, words, order)
  }, [contracts])

  useEffect(( ) => {
    getTokens(contracts, words, order)
  }, [order])

  useEffect(() => {
    if (flag) return
    flag = true

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
    })

  }, [flag])

  const sortContracts = (contracts, order) => {
    let oldContracts = [...contracts]
    let newContracts = []
    newContracts = oldContracts.sort((a, b) => {
      switch(order.status) {
        case "created_at":
          if (a.created_at === undefined && b.created_at === undefined) return 0;
          if (a.created_at === undefined) return order.inc ? -1 : 1
          if (b.created_at === undefined) return order.inc ? 1 : -1
          if (a.created_at > b.created_at) return order.inc ? 1 : -1
          if (a.created_at < b.created_at) return order.inc ? -1 : 1
          return 0
        case "updated_at":
          if (a.updated_at === undefined && b.updated_at === undefined) return 0;
          if (a.updated_at === undefined) return order.inc ? -1 : 1
          if (b.updated_at === undefined) return order.inc ? 1 : -1
          if (a.updated_at > b.updated_at) return order.inc ? 1 : -1
          if (a.updated_at < b.updated_at) return order.inc ? -1 : 1
          return 0
        case "sniped":
          if (a.firstBlockBuyCount === undefined && b.firstBlockBuyCount === undefined) return 0;
          if (a.firstBlockBuyCount === undefined) return order.inc ? -1 : 1
          if (b.firstBlockBuyCount === undefined) return order.inc ? 1 : -1
          if (a.firstBlockBuyCount > b.firstBlockBuyCount) return order.inc ? 1 : -1
          if (a.firstBlockBuyCount < b.firstBlockBuyCount) return order.inc ? -1 : 1
          return 0
        case "buy":
          if (a.buyCount === undefined && b.buyCount === undefined) return 0;
          if (a.buyCount === undefined) return order.inc ? -1 : 1
          if (b.buyCount === undefined) return order.inc ? 1 : -1
          if (a.buyCount > b.buyCount) return order.inc ? 1 : -1
          if (a.buyCount < b.buyCount) return order.inc ? -1 : 1
          return 0
        case "sell":
          if (a.sellCount === undefined && b.sellCount === undefined) return 0;
          if (a.sellCount === undefined) return order.inc ? -1 : 1
          if (b.sellCount === undefined) return order.inc ? 1 : -1
          if (a.sellCount > b.sellCount) return order.inc ? 1 : -1
          if (a.sellCount < b.sellCount) return order.inc ? -1 : 1
          return 0
        case "blockNumber":
          if (a.blockNumber === undefined && b.blockNumber === undefined) return 0;
          if (a.blockNumber === undefined) return order.inc ? -1 : 1
          if (b.blockNumber === undefined) return order.inc ? 1 : -1
          if (a.blockNumber > b.blockNumber) return order.inc ? 1 : -1
          if (a.blockNumber < b.blockNumber) return order.inc ? -1 : 1
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
      placement: 'topLeft'
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
      let flag = true;
      for(let word of words.split(" ")) {
        word = word.toLowerCase();
        if (word == "sniped") {
          if(!(contract.firstBlockBuyCount > 0)) {
            flag = false;
            break;
          }
        }
        else {
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
      }
      return flag;
    })
    let orderContracts = sortContracts(filterContracts, order)
    setTokens(orderContracts)
  }

  // function submitName() {
  //   console.log(inputName.current.value)
  //   dispatch(SET_NAME(inputName.current.value))
  // }

  const onChange = (e) => {
    dispatch(SET_WORDS(e.target.value))
    getTokens(contracts, e.target.value, order)
  }

  const copyBtnClicked = (e, value) => {
    navigator.clipboard.writeText(value)
  }

  const isThisCopyBtn = (list) => {
    for(const item of list) {
      if (item == "copy-btn") return true;
    }
    return false;
  }

  const tokenClicked = (e, address) => {
    if(isThisCopyBtn(e.target.classList)) return;
    console.log("token clicked", address)
    router.push('/token-page?address=' + address);  
  }

  return (
    <>
      <main className={styles.main}>  
        <div className='d-flex my-5 w-100'>
          <div className='ms-5 clock'>
            {/* <Clock/>      */}
          </div>
          <div className='search-bar w-50'>
            <Search
              placeholder="Search for tokens"
              allowClear
              size="large"
              onChange={onChange} 
              value={words}
              enterButton
            />
          </div>    
        
        </div>
        <div className='sniper-table'>
          <table className="table-dark m-3">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Name(Symbol)</th>
                <th scope="col">Owner Address</th>
                <th scope="col">Token Address</th>
                <th scope="col">Pair Address</th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "created_at", inc: 0}))}>Created_at <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "updated_at", inc: 0}))}>Updated_at <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "sniped", inc: 0}))}>Sniped <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "buy", inc: 0}))}>Buy <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "sell", inc: 0}))}>Sell <FontAwesomeIcon icon={faSort} /></th>
                <th className='sortTh' scope="col" onClick={() => dispatch(SET_ORDER({status: "blockNumber", inc: 0}))}>BlockNumber <FontAwesomeIcon icon={faSort} /></th>
              </tr>
            </thead>
            <tbody>
              {
                tokens.map((token, index) => {  
                  if(!token) return;
                  return <tr onClick={(e) => tokenClicked(e, token.address)} key={index} className='my-3 token-tr'>
                    <th scope='row'>{index + 1}</th>
                    <td><p>{token.name.slice(0, Math.min(20, token.name.length))}</p>({token.symbol})</td>
                    <td>
                      {
                        token.owner && <div className='d-flex justify-content-between align-items-center'>
                          <p>{token.owner.toLowerCase().slice(0, 8) + "..." + token.owner.toLowerCase().slice(-6)}</p>
                          <Tooltip placement="top" title={"Copied:" + token.owner.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.owner.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>
                      {
                        token.address && <div className='d-flex justify-content-between align-items-center'>
                          <p>{token.address.toLowerCase().slice(0, 8) + "..." + token.address.toLowerCase().slice(-6)}</p>
                          <Tooltip placement="top" title={"Copied:" + token.address.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.address.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>
                      {
                        token.pair && <div className='d-flex justify-content-between align-items-center'>
                          <p>{token.pair.toLowerCase().slice(0, 8) + "..." + token.pair.toLowerCase().slice(-6)}</p>
                          <Tooltip placement="top" title={"Copied:" + token.pair.toLowerCase()} trigger={"click"}>
                            <button className='copy-btn btn btn-dark ms-2' onClick={(e) => copyBtnClicked(e, token.pair.toLowerCase())}>C</button>
                          </Tooltip>
                        </div>
                      }
                    </td>
                    <td>{convertTimezone(token.created_at)}</td>
                    <td>{convertTimezone(token.updated_at)}</td>
                    <td>{token.firstBlockBuyCount ? token.firstBlockBuyCount : 0}</td>
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
            padding: 1vw 0;
            &.sortTh:hover {
              cursor: pointer;
              background-color: grey;      
            } 
          }
          .search-bar {
            text-align: center;
            .ant-input-group-wrapper {
              width: 50%
            }
            .ant-input-affix-wrapper-lg {
              background-color: black;
              color: white;
            }
            input::placeholder {
              color: #1677ff;
            }
          }
          .token-tr:hover {
            cursor: pointer;
            background-color: grey;
          }
          .clock {
            width: 200px;
            max-width: 200px;
          }
        `}
        </style>
      </main>
    </>
  )
}

export default Home