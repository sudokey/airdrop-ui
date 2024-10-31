import { AirdropState, AirdropUI } from '@gigadrop/ui'
import { Address as TonAddress } from '@ton/core'
import { CHAIN, THEME, TonConnectUI } from '@tonconnect/ui'
import { ProviderRpcClient } from 'everscale-inpage-provider'
import { Clock, EverscaleStandaloneClient } from 'everscale-standalone-client'
import { html, render } from 'lit-html'
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

const airdropUI = new AirdropUI(tonConnectUI, rpc, clock)

airdropUI.subscribe(state => {
    render(template(state), document.body)
})

render(airdropUI.getState(), document.body)

function connect() {
    try {
        tonConnectUI.openModal()
    }
    catch (e) {
        console.error(e)
    }
}

function disconnect() {
    try {
        tonConnectUI.disconnect()
    }
    catch (e) {
        console.error(e)
    }
}

function template(state: AirdropState) {
    return html`
        <div>
            <h1>TON Claim</h1>

            <div class="grid">
                <div>Wallet</div>
                <div>
                    ${state.userAddress ? html`
                        <button @click=${disconnect}>Disconnect</button>
                    ` : html`
                        <button @click=${connect}>Connect</button>
                    `}
                </div>

                <div>Airdrop</div>
                <div>
                    <select
                        .value=${state.airdropName ?? ''}
                        @change=${(e: Event) => airdropUI.setAirdropName((e.target as HTMLSelectElement).value)}
                    >
                        <option></option>
                        <option value="test1">Test1</option>
                        <option value="test2">Test2</option>
                        <option value="test3">Test3</option>
                        <option value="test4">Test4</option>
                        <option value="test5">Test5</option>
                        <option value="test6">Test6</option>
                        <option value="test7">Test7</option>
                        <option value="test8">Test8</option>
                        <option value="test9">Test9</option>
                        <option value="test10">Test10</option>
                    </select>
                </div>

                <div>Status</div>
                ${state.status === AirdropStatus.NoUser ? html`
                    <div>Connect wallet</div>
                ` : state.status === AirdropStatus.HasClaimed ? html`
                    <div>Reward claimed</div>
                ` : state.status === AirdropStatus.CanClaim ? html`
                    <div>
                        <button
                            .disabled=${state.loading || state.claimLoading}
                            @click=${() => airdropUI.claim()}
                        >
                            ${state.loading || state.claimLoading ? 'Claim...' : 'Claim'}
                        </button>
                    </div>
                ` : state.status === AirdropStatus.InQueue ? html`
                    <div>In queue</div>
                ` : state.status === AirdropStatus.NoReward ? html`
                    <div>No reward</div>
                ` : state.status === AirdropStatus.NoAirdrop ? html`
                    <div>Select airdrop</div>
                ` : html`
                    <div>Loading...</div>
                `}

                ${state.userAddress ? html`
                    <h3>User address</h3>
                    <div>Raw address</div>
                    <div>${state.userAddress}</div>
                    <div>Bounceable</div>
                    <div>${TonAddress.parseRaw(state.userAddress).toString()}</div>
                    <div>Non bounceable</div>
                    <div>${TonAddress.parseRaw(state.userAddress).toString({ bounceable: false })}</div>
                ` : null}

                ${state.claimData ? html`
                    <h3>Claim data</h3>
                    ${state.claimData?.status === 'signed' ? html`
                        <div>Status</div>
                        <div>${state.claimData.status}</div>
                        <div>Factory address</div>
                        <div>${state.claimData.factory}</div>
                        <div>Airdrop</div>
                        <div>${state.claimData.airdrop}</div>
                        <div>Data</div>
                        <div>${state.claimData.data}</div>
                        <div>Signature</div>
                        <div>${state.claimData.signature}</div>
                        <div>Reward</div>
                        <div>${state.claimData.reward}</div>
                        <div>Nonce</div>
                        <div>${state.claimData.nonce}</div>
                    ` : state.claimData?.status === 'inQueue' ? html`
                        <div>Status</div>
                        <div>${state.claimData.status}</div>
                        <div>Place</div>
                        <div>${state.claimData.place}</div>
                    ` : state.claimData?.status === 'noReward' ? html`
                        <div>Status</div>
                        <div>${state.claimData.status}</div>
                    ` : null}
                ` : null}
            </div>
        </div>
    `
}
