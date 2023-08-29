<script setup lang="ts">
const emit = defineEmits(['longPress', 'longPressEnd'])
const props = defineProps(['speed']);
let mouseTimer: ReturnType<typeof setTimeout> = 0;
const speed = props.speed || 100
const emitLongPress = (time: number, oldTime: number) => {

    let o = oldTime;
    if (!mouseTimer) return;
    if (time - oldTime > speed) {
        emit('longPress');
        o = time;
    }
    requestAnimationFrame((newTime: number) => {
        emitLongPress.apply(null, [newTime, o])
    }
    )
}


const onMousedown = () => {


    mouseTimer && clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        // emit longpress, loop in requestAnimationFrame
        // emitLongPress(0, 0)

        emit('longPress');


    }, 500);
}
const onMouseup = () => {
    mouseTimer && clearTimeout(mouseTimer);
    mouseTimer = 0;
    emit('longPressEnd');

}
</script>

<template>
    <div class="handler-button" @mousedown="onMousedown" @mouseup="onMouseup">
        <slot></slot>
    </div>
</template>