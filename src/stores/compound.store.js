/**
 * @format
 */
import { runInAction, makeAutoObservable, observable } from "mobx"
import userStore from "./user.store"
import {getCompUserInfo } from "../lib/compound.interface"
import CToken, { CoinStatusEnum } from "../lib/compound.util"
import Web3 from "web3"

const {BN, toWei, fromWei} = Web3.utils
const _1e18 = new BN(10).pow(new BN(18))

class CompoundStore {

    userInfo
    userInfoTimeouts = []
    userInfoUpdate = 0

    coinList = []
    showBorrowReapyBox = false
    showDepositWithdrawBox = false

    totalDespositedBalanceInUsd
    totalBorrowedBalanceInUsd
    borrowLimitInUsd
    coinMap = {}
    coinsInTx = {}

    constructor (){
        makeAutoObservable(this)
    }

    toggleInTx = (address, inTx) => {
        if(inTx){
            this.coinsInTx[address] = inTx
        }else{
            delete this.coinsInTx[address]
        }
        this.showHideEmptyBalanceBoxs()    
    }

    getUserInfo = async () => {
        try {
            const { web3, networkType, user } = userStore
            let compUserInfo = await getCompUserInfo(web3, networkType, user)
            runInAction(()=> {
                this.userInfo = compUserInfo
                this.initCoins()
                this.calcDpositedBalance()
                this.calcBorrowedBalance()
                this.calcBorrowLimit()
                this.userInfoUpdate ++
                this.coinList = Object.keys(this.userInfo.bUser)
                this.showHideEmptyBalanceBoxs()
            })
        } catch (err) {
            console.log(err)
        }
    }

    showHideEmptyBalanceBoxs = () =>{
        let noCoinDeposited = true
        let noCoinBorrowed = true
        const coins = Object.values(Object.assign({}, this.coinMap, this.coinsInTx)).forEach(coin => {
            if(coin.status === CoinStatusEnum.deposited){
                noCoinDeposited = false
            }
            if(coin.status === CoinStatusEnum.borrowed){
                noCoinBorrowed = false
            }
        })
        this.showBorrowReapyBox = noCoinBorrowed
        this.showDepositWithdrawBox = noCoinDeposited
    }

    getBuserTokenData = (address) => {
        if(!this.userInfo){
            return
        }
        return [this.userInfo.bUser[address], this.userInfo.tokenInfo[address]]
    }

    /**
     * permits only four timeouts
     */
    fetchAndUpdateUserInfo = async () => { 
        await this.getUserInfo()
        const timeouts = [1500, 5000, 19000, 30000]
        this.userInfoTimeouts.forEach(clearTimeout) // clearing all timeouts
        this.userInfoTimeouts = timeouts.map(timeout => setTimeout(this.getUserInfo, timeout)) // setting 4 new one
    }

    initCoins = () => {
        Object.keys(this.userInfo.bUser).forEach(address=> {
            const [data, info] = this.getBuserTokenData(address)
            this.coinMap[address] = new CToken(address, data, info)
        })
    }

    calcDpositedBalance = () => {
        let depositsInUsd = new BN(0)
        Object.values(this.coinMap).forEach(coin => {
            depositsInUsd = depositsInUsd.add(new BN(toWei(coin.underlyingBalanceUsdStr).toString()))
        })
        this.totalDespositedBalanceInUsd = fromWei(depositsInUsd)
    }

    calcBorrowedBalance = () => {
        
        let borrowedInUsd = new BN(0)
        Object.values(this.coinMap).forEach(coin => {
            borrowedInUsd = borrowedInUsd.add(new BN(toWei(coin.borrowedUsd).toString()))
        })
        this.totalBorrowedBalanceInUsd = fromWei(borrowedInUsd)
    }

    calcBorrowLimit = () => {
        // TODO: re visit this calculation 
        // we might need to multiply the CF with the original Asset depositied amount and not it's USD representation
        let borrowLimitInUsd = new BN(0)
        Object.values(this.coinMap).forEach(coin => {
            const deposit = new BN(toWei(coin.underlyingBalanceUsdStr).toString())
            const cf = new BN(coin.tokenInfo.collateralFactor)
            const coinBorrowLimit = (deposit.mul(cf)).div(_1e18)
            borrowLimitInUsd = borrowLimitInUsd.add(coinBorrowLimit)
        })
        this.borrowLimitInUsd = fromWei(borrowLimitInUsd)
    }
}

export default new CompoundStore()