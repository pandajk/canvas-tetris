<script setup lang="ts">
import { ref, onMounted, } from 'vue';
import Handler from '@/components/Handler.vue';
import Tetris from './tetris';

const canvas = ref<any>(null)
const game = ref<Tetris | null>(null)

const score = ref<number>(0)

const eventhandler = (evtType: string, data: {}) => {

  console.log('eventhandler', evtType, data);

  switch (evtType) {
    case 'onGameReady':

      break;
    case 'onAccountedResult':
      score.value = game.value?.getScore() || 0;
      break;

    default:
      break;
  }

}
onMounted(() => {
  try {
    if (canvas.value) {
      game.value = new Tetris(canvas.value,);
      game.value.init()

      game.value.setSubscriber(eventhandler)
    }

  } catch (error) {

  }
})
const onHandleAction = (evt: { action: GameHandleAction, isLongPress: boolean }) => {
  const { down, toLeft, toRight, home, start, oprY, oprX, oprA, oprB, speedUp } = game.value?.handler || {}
  switch (evt.action) {
    case 'HOME':
      home?.()
      break;
    case 'START':
      start?.()
      break;
    case 'down':
      down?.();
      console.log('evt.isLongPress', evt.isLongPress);

      if (evt.isLongPress) {
        speedUp?.()
      }
      break
    case 'left':
      toLeft?.();
      break;
    case 'right':
      toRight?.()
      break;

    case 'Y':
      oprY?.();
      break;
    case 'X':
      // suspend?.()
      oprX?.()
      break;
    case 'A':
      oprA?.()
      break; case 'B':
      oprB?.()
      break;
  }
}
</script>

<template>
  <p>tetris:{{ score }}</p>
  <canvas ref="canvas"></canvas>
  <Handler @handle-action="onHandleAction" />
</template>

<style>
canvas {
  width: 500px;
  height: 500px;
  /* background-color: #000; */
}
</style>@/pages/tetris/game