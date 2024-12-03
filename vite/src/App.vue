<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import { TonConnectUI, THEME, CHAIN } from '@tonconnect/ui'
    import { Clock, EverscaleStandaloneClient } from 'everscale-standalone-client'
    import { ProviderRpcClient } from 'everscale-inpage-provider'
    import { Address as TonAddress } from '@ton/core'
    import { AirdropUI } from '@gigadrop/ui'
    import { AirdropStatus } from '@gigadrop/ui/dist/types';

    const clock = new Clock()

    const rpc = new ProviderRpcClient({
        fallback: () => EverscaleStandaloneClient.create({
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

    const state = ref(airdropUI.getState());

    function connect() {
        try {
            tonConnectUI.openModal()
        } catch (e: unknown) {
            console.error(e)
        }
    }

    function disconnect() {
        try {
            tonConnectUI.disconnect()
        } catch (e: unknown) {
            console.error(e)
        }
    }

    onMounted(() => {
        airdropUI.subscribe(next => {
            state.value = next
        })
        state.value = airdropUI.getState()
    })
</script>

<template>
    <h1>TON Claim</h1>

    <div className="grid">
        <div>Wallet</div>
        <div>
            <button v-if="state.userAddress" @click="disconnect">Disconnect</button>
            <button v-if="!state.userAddress" @click="connect">Connect</button>
        </div>

        <div>Airdrop</div>
        <div>
            <select
                style="width: 200px;"
                v-bind:value="state.airdropName"
                v-on:change="e => airdropUI.setAirdropName((e.target as HTMLSelectElement).value)"
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
                <option value='test_claim_id'>test_claim_id</option>
            </select>
        </div>

        <div>Claim ID</div>
        <div>
            <select
                style="width: 200px;"
                v-bind:value="state.claimId"
                v-on:change="e => airdropUI.setClaimId((e.target as HTMLSelectElement).value)"
            >
                <option></option>
                <template v-if="state.claimData?.status === 'signed'">
                    <option v-for="item in state.claimData.rewards" v-bind:key="item.claimId">
                        {{ item.claimId }}
                    </option>
                </template>
            </select>
        </div>

        <div>Status</div>
        <div v-if="state.status === AirdropStatus.NoUser">Connect wallet</div>
        <div v-else-if="state.status === AirdropStatus.HasClaimed">Reward claimed</div>
        <div v-else-if="state.status === AirdropStatus.CanClaim">
            <button
                :disabled="state.loading || state.claimLoading"
                @click="() => airdropUI.claim()"
            >
                {{ state.loading || state.claimLoading ? 'Claim...' : 'Claim' }}
            </button>
        </div>
        <div v-else-if="state.status === AirdropStatus.InQueue">In queue</div>
        <div v-else-if="state.status === AirdropStatus.NoReward">No reward</div>
        <div v-else-if="state.status === AirdropStatus.NoAirdrop">Select airdrop</div>
        <div v-else-if="state.status === AirdropStatus.NoClaimId">Select claim id</div>
        <div v-else>Loading...</div>

        <template v-if="state.userAddress">
            <h3>User address</h3>
            <div>Raw address</div>
            <div>{{ state.userAddress }}</div>
            <div>Bounceable</div>
            <div>{{ TonAddress.parseRaw(state.userAddress).toString() }}</div>
            <div>Non bounceable</div>
            <div>{{ TonAddress.parseRaw(state.userAddress).toString({ bounceable: false })}}</div>
        </template>

        <template v-if="state.claimData">
            <h3>Claim data</h3>
            <template v-if="state.claimData?.status === 'signed'">
                <template v-for="(reward, index) in state.claimData.rewards" v-bind:key="reward.claimId">
                    <h4>Reward #{{index + 1}}</h4>
                    <div>Claim ID</div>
                    <div>{{ reward.claimId }}</div>
                    <div>Factory address</div>
                    <div>{{ reward.factory }}</div>
                    <div>Airdrop</div>
                    <div>{{ reward.airdrop }}</div>
                    <div>Data</div>
                    <div>{{ reward.data }}</div>
                    <div>Signature</div>
                    <div>{{ reward.signature }}</div>
                    <div>Reward</div>
                    <div>{{ reward.reward }}</div>
                    <div>Nonce</div>
                    <div>{{ reward.nonce }}</div>
                </template>
            </template>
            <template v-if="state.claimData?.status === 'inQueue'">
                <div>Status</div>
                <div>{{ state.claimData.status }}</div>
                <div>Place</div>
                <div>{{ state.claimData.place }}</div>
            </template>
            <template v-if="state.claimData?.status === 'noReward'">
                <div>Status</div>
                <div>{{ state.claimData.status }}</div>
            </template>
        </template>
    </div>
</template>

<style>
.grid {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1em 2em;
}

h3,
h4 {
    grid-column: 1/-1;
    margin: 1em 0 0;
}
</style>
