import { AirdropUI } from '@gigadrop/ui'
import { Address as TonAddress } from '@ton/core'
import { CHAIN, THEME, TonConnectUI } from '@tonconnect/ui'
import { ProviderRpcClient } from 'everscale-inpage-provider'
import { Clock, EverscaleStandaloneClient } from 'everscale-standalone-client'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AirdropStatus } from '@gigadrop/ui/dist/types'

const clock = new Clock()

const rpc = new ProviderRpcClient({
    fallback: () =>
        EverscaleStandaloneClient.create({
            clock,
            connection: {
                data: {
                    endpoint: 'https://jrpc-ton.broxus.com/rpc',
                },
                id: Number(CHAIN.MAINNET),
                type: 'jrpc',
            },
        }),
    forceUseFallback: true,
})

const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://raw.githubusercontent.com/ton-connect/demo-dapp-with-wallet/master/public/tonconnect-manifest.json',
    uiPreferences: {
        theme: THEME.LIGHT,
    },
})

const airdropUI = new AirdropUI(tonConnectUI.connector, rpc, clock)

export const App = () => {
    const [state, setState] = React.useState(() => airdropUI.getState())

    const connect = () => {
        try {
            tonConnectUI.openModal()
        }
        catch (e) {
            console.error(e)
        }
    }

    const disconnect = () => {
        try {
            tonConnectUI.disconnect()
        }
        catch (e) {
            console.error(e)
        }
    }

    React.useEffect(() => {
        airdropUI.setAirdropName('test_claim_id')
        return airdropUI.subscribe(setState)
    }, [])

    return (
        <div>
            <h1>TON Claim</h1>

            <div className='grid'>
                <div>Wallet</div>
                <div>
                    {state.userAddress
                        ? <button onClick={disconnect}>Disconnect</button>
                        : <button onClick={connect}>Connect</button>}
                </div>

                <div>Airdrop</div>
                <div>
                    <select
                        style={{ width: '200px' }}
                        value={state.airdropName ?? undefined}
                        onChange={e => airdropUI.setAirdropName(e.target.value)}
                    >
                        <option></option>
                        <option value='test1'>Test1</option>
                        <option value='test2'>Test2</option>
                        <option value='test3'>Test3</option>
                        <option value='test4'>Test4</option>
                        <option value='test5'>Test5</option>
                        <option value='test6'>Test6</option>
                        <option value='test7'>Test7</option>
                        <option value='test8'>Test8</option>
                        <option value='test9'>Test9</option>
                        <option value='test10'>Test10</option>
                        <option value='test_claim_id'>test_claim_id</option>
                    </select>
                </div>

                <div>Claim ID</div>
                <div>
                    <select
                        style={{ width: '200px' }}
                        value={state.claimId ?? undefined}
                        onChange={e => airdropUI.setClaimId(e.target.value)}
                    >
                        <option></option>
                        {state.claimData?.status === 'signed' && (
                            state.claimData.rewards.map(item => (
                                <option key={item.claimId} value={item.claimId}>
                                    {item.claimId}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div>Status</div>

                {state.status === AirdropStatus.NoUser ? (
                    <div>Connect wallet</div>
                ) : state.status === AirdropStatus.HasClaimed ? (
                    <div>Reward claimed</div>
                ) : state.status === AirdropStatus.CanClaim ? (
                    <div>
                        <button
                            disabled={state.loading || state.claimLoading}
                            onClick={() => airdropUI.claim()}
                        >
                            {(state.loading || state.claimLoading) ? 'Claim...' : 'Claim'}
                        </button>
                    </div>
                ) : state.status === AirdropStatus.InQueue ? (
                    <div>In queue</div>
                ) : state.status === AirdropStatus.NoReward ? (
                    <div>No reward</div>
                ) : state.status === AirdropStatus.NoAirdrop ? (
                    <div>Select airdrop</div>
                ) : state.status === AirdropStatus.NoClaimId ? (
                    <div>Select claimId</div>
                ) : (
                    <div>Loading...</div>
                )}

                {state.userAddress && (
                    <>
                        <h3>User address</h3>
                        <div>Raw address</div>
                        <div>{state.userAddress}</div>
                        <div>Bounceable</div>
                        <div>{TonAddress.parseRaw(state.userAddress).toString()}</div>
                        <div>Non bounceable</div>
                        <div>{TonAddress.parseRaw(state.userAddress).toString({ bounceable: false })}</div>
                    </>
                )}

                {state.claimData && (
                    <>
                        <h3>Claim data</h3>
                        {state.claimData?.status === 'signed'
                            ? (
                                state.claimData.rewards.map((reward, index) => (
                                    <React.Fragment key={reward.claimId}>
                                        <h4>Reward #{index + 1}</h4>
                                        <div>Claim ID</div>
                                        <div>{reward.claimId}</div>
                                        <div>Factory address</div>
                                        <div>{reward.factory}</div>
                                        <div>Airdrop</div>
                                        <div>{reward.airdrop}</div>
                                        <div>Data</div>
                                        <div>{reward.data}</div>
                                        <div>Signature</div>
                                        <div>{reward.signature}</div>
                                        <div>Reward</div>
                                        <div>{reward.reward}</div>
                                        <div>Nonce</div>
                                        <div>{reward.nonce}</div>
                                    </React.Fragment>
                                ))
                            )
                            : state.claimData?.status === 'inQueue'
                            ? (
                                <>
                                    <div>Status</div>
                                    <div>{state.claimData.status}</div>
                                    <div>Place</div>
                                    <div>{state.claimData.place}</div>
                                </>
                            )
                            : state.claimData?.status === 'noReward'
                            ? (
                                <>
                                    <div>Status</div>
                                    <div>{state.claimData.status}</div>
                                </>
                            )
                            : null}
                    </>
                )}
            </div>
        </div>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
