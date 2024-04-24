
import styles from '@/styles/Home.module.css'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { SET_NAME } from '../../redux/reducers/profileSlice'
import io from 'socket.io-client'

function DisplayName(){
  const {name} = useSelector((state) => state.profile)

  return (
    <h1> I am {name} !!</h1> 
  ) 
}


const Home = () => {

  const [tokens, setTokens] = useState(['0', '1'])

  const inputName = useRef()
  const dispatch  = useDispatch()
  
  let flag        = false

  useEffect(() => {
    if (flag) return
    flag = true

    const socket = io('http://135.181.0.186:83')
    socket.on('clientConnected', (data) => {
      console.log(data)
      setTokens(data.contracts)
    })
    socket.on('newContractCreated', (data) => {
      console.log(data)
    })
    socket.on('newPairCreated', (data) => {
      console.log(data)
    })
    socket.on('swapEnabled', (data) => {
      console.log(data)
    })
    socket.on('sniperAttack', (data) => {
      console.log(data)
    })
  }, [flag])


  function submitName() {
    console.log(inputName.current.value)
    dispatch(SET_NAME(inputName.current.value))
  }

  return (
    <>
      <main className={styles.main}>  
        {/* <input placeholder='enter name' ref={inputName} />
        <button onClick={submitName}>Enter name</button>
        <DisplayName /> */}
        { 
          tokens.map((token, index) => {  
            return <div className={styles.token} key={index}>
              <div className='d-flex justify-content-center align-items-center'>
                <h1 className='me-2'>{token.name}({token.symbol})</h1>   
                <h3 className='text-danger'>{ token.firstBlockBuyCount > 0 ? `${token.firstBlockBuyCount} sniped` : ""}</h3>
              </div>
              <p>token: {token.address}</p>
              <p>pair: {token.pair}</p>
              <p>created_at: {token.created_at}</p>
              <p>updated_at: {token.updated_at}</p>
              <p>buyCount: {token.buyCount ? token.buyCount : 0}</p>
              <p>sellCount: {token.sellCount ? token.sellCount : 0}</p>
              <p>firstBlockSellCount: {token.firstBlockSellCount ? token.firstBlockSellCount : 0}</p>
            </div>
          })
        }
      </main>
    </>
  )
}

export default Home