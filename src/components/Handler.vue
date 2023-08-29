<script setup lang="ts">
import HandlerButton from '@/components/HandlerButton.vue'

const emit = defineEmits(['handle-action'])
const toUp = (_: MouseEvent | KeyboardEvent, isLongPress: boolean = false) => {
    emit('handle-action', {
        action: 'up',
        isLongPress
    })
}
const toLeft = (_: MouseEvent | KeyboardEvent, isLongPress: boolean = false) => {
    console.log('toleft');

    emit('handle-action', {

        action: 'left',
        isLongPress
    })

}
const toRight = (_: MouseEvent | KeyboardEvent, isLongPress: boolean = false) => {
    emit('handle-action', {
        action: 'right',
        isLongPress
    })

}
const toDown = (_: MouseEvent | KeyboardEvent, isLongPress: boolean = false) => {
    console.log('toDown', isLongPress);

    emit('handle-action', {
        action: 'down',
        isLongPress
    })
}

const longPressDown = ($event: MouseEvent | KeyboardEvent,) => {
    console.log('longPressDown');

    toDown.call(null, $event, true)
}


</script>
<template>
    <div class="flex-block">
        <div class="flex left-area">
            <HandlerButton class="btn up" @click="toUp" @longPress="toUp.bind(null, $event, true)">⬆️</HandlerButton>
            <div class="flex-block center">
                <HandlerButton class="btn left" @click="toLeft" @longPress="toLeft.bind(null, $event, true)">⬅️
                </HandlerButton>
                <HandlerButton class="btn right" @click="toRight" @longPress="toRight.bind(null, $event, true)">➡️
                </HandlerButton>
            </div>
            <HandlerButton class="btn down" speed="100" @click="toDown" @longPress="longPressDown">⬇️
            </HandlerButton>
        </div>
        <div class="flex">
            <HandlerButton class="btn up" @click="$emit('handle-action', { action: 'HOME' })"
                @longPress="$emit('handle-action', { action: 'HOME' })">🏠
            </HandlerButton>
            <HandlerButton class="btn up" @click="$emit('handle-action', { action: 'START' })"
                @longPress="$emit('handle-action', { action: 'START' })">🟢
            </HandlerButton>

        </div>
        <div class="flex right-area">
            <HandlerButton class="btn up" @click="$emit('handle-action', { action: 'Y' })"
                @longPress="$emit('handle-action', { action: 'Y' })">Y
            </HandlerButton>
            <div class="flex-block center">
                <HandlerButton class="btn left" @click="$emit('handle-action', { action: 'X' })"
                    @longPress="$emit('handle-action', { action: 'X' })">X</HandlerButton>
                <HandlerButton class="btn right" @click="$emit('handle-action', { action: 'B' })"
                    @longPress="$emit('handle-action', { action: 'B' })">🅱️</HandlerButton>
            </div>
            <HandlerButton class="btn down" @click="$emit('handle-action', { action: 'A' })"
                @longPress="$emit('handle-action', { action: 'A' })">
                🅰️
            </HandlerButton>

        </div>
    </div>
</template>

<style>
.flex-block {
    display: flex;

}

.flex {
    flex: 1;
}

.center {
    align-items: center;
    justify-content: center;
}

.btn {
    user-select: none;
    font-size: 40px;
    padding: 8px;
    cursor: pointer;

    &:hover {
        transform: scale(1.4);
    }

    &:target,
    &:visited,
    &:active {
        filter: brightness(0.9);
    }
}
</style>