<script lang="ts">
    import { Divider, Input, Placeholder, Grids, Grid } from 'stdf';
    import scriptable from "../../api/scriptable";
    import IosWidget from "./module/IosWidget.svelte";
    import EmojiList from './module/imageList'
    import { IExcess } from "../../interface/scriptableHome.interface";
    import gsap from "gsap";
    import { Draggable } from "gsap/Draggable";
    gsap.registerPlugin(Draggable);
    import { onMount, tick } from "svelte";

    let infos;
    let message: string;
    let time;
    let excessList:IExcess[] = []
    let widget;
    let excessTl = [];
    let excessTTL = 0.8
    let excessCount = 10;
    let rect:PointerEvent;
    let sendEmojiCount = 0;

    scriptable.getHomeInfos().then((response) => {
      console.log('response', response);
      if (response.data.code === 0) {
        infos = response.data.data
      }
    });

    onMount(() => {
      Draggable.create(".drag-emoji", {
        // minimumMovement: 10, 最小拖拽距离(像素)
        bounds: '.drag-content',
        onMove: (moveRect) => {
          rect = moveRect
        },
        onDragEnd: (moveRect) => {
          console.log('moveRect', moveRect)
          gsap.to(moveRect.target, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.2,
            filter: 'none',
            zIndex: 20,
            x: 0,
            y: 0,
          })
          rect = null;
        },
        onDragStart: (moveRect) => {
          gsap.to(moveRect.target, {
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 0.2,
            filter: 'drop-shadow(0 0 5px #000000)',
            zIndex: 20,
          })
        }
      });
    });

    const clickLabel4Fun = () => {
      console.log('1', 1)
    }

    const init = () => {
      // 清除上一次动画
      excessTl.forEach(item => item.kill());
      excessTl = []
      sendEmojiCount = 0;
    }

    const mouseDown = async (e: TouchEvent, path) => {
      if (e.targetTouches && e.targetTouches.length === 0) {
        return;
      }

      init();

      const toucheCoords = e.targetTouches[0];
      const touchRect = toucheCoords.target.getBoundingClientRect() as DOMRect;
      // console.log('toucheCoords', touchRect);

      excessList = Array(excessCount * 2).fill({
        path,
        startX: touchRect.x,
        startY: touchRect.y,
        endX: 0,
        endY: 0,
        ttl: 500,
      })

      const imgDom:Element = widget.getEmojiDom();
      const imgRect = imgDom.getBoundingClientRect();
      await tick();

      // 重新设置动画
      excessTl.push(createTouchAnimate(".excess-emoji0", touchRect, imgRect, { paused: true }));
      excessTl.push(createTouchAnimate(".excess-emoji1", touchRect, imgRect, { paused: true }));
      excessTl.forEach((item, key) => {
        const time = setTimeout(() => {
          item.seek(0);
          item.resume();
          clearTimeout(time);
        }, key * 1000 * excessTTL)
      });

      console.log('excessTl', excessTl)
    }

    const createTouchAnimate = (className: string, startRect: DOMRect, endRect: DOMRect, option: any = {}, offset = 0) => {
      return gsap.fromTo(className, {
        rotation: 0,
        opacity: 0.7,
        scaleX: 1,
        scaleY: 1,
        x: function(index, target, targets) { //function-based value
          ++sendEmojiCount;
          if (rect) {
            return rect.clientX - 40;
          }

          return startRect.x;
        },
        y: function(index, target, targets) { //function-based value
          if (rect) {
            return rect.clientY - 40;
          }

          return startRect.y;
        },
      }, Object.assign({
        opacity: 1,
        rotation: `random(-50, 50)`,
        x: `random(${endRect.x - 10}, ${endRect.x + 10})`,
        y: `random(${endRect.y - 10}, ${endRect.y + 10})`,
        scaleX: 1.4,
        scaleY: 1.4,
        ease: "expo.out",
        stagger: excessTTL / excessCount,
        duration: excessTTL,
        repeatRefresh: true,
        repeatDelay: 0,
        repeat: -1,
      }, option), offset)
    }

    const mouseUp = (e: TouchEvent, path) => {
      excessTl.forEach(item => {
        item.repeat(0)
      });
    }

    const getMouseRect = (value) => {
      console.log('va', value);
      return value;
    }
</script>

<div class="relative">
  <div class="pb-1 pt-1">
    <div class="mx-2 rounded-xl p-2 shadow">
      <IosWidget bind:this={widget} infos={infos} />
    </div>
  </div>

  <div class="drag-content mt-5 overflow-scroll">
    <Divider />
    <Placeholder height="64">
      <Grids cols={4}>
        {#each EmojiList as path}
          <Grid>
            <div
              class="drag-emoji relative"
              on:touchstart|preventDefault={(e) => mouseDown(e, path)}
              on:touchend|preventDefault={(e) => mouseUp(e, path)}>
              <img class="text-center pointer-events-none" src={`/public/assets/emoji/${path}`} alt="">
            </div>
          </Grid>
        {/each}
      </Grids>
    </Placeholder>
  </div>
  <div>{sendEmojiCount}</div>
  <div class="fixed top-0 left-0 pointer-events-none">

    {#each excessList as excessEmoji, index}
      <img
        class={`fixed pointer-events-none z-10 excess-emoji${index % 2}`}
        src={`/public/assets/emoji/${excessEmoji.path}`} alt="">
    {/each}
  </div>

  <div>
    <Input
      placeholder="有啥想说的"
      bind:value={message}
      label4={{ name: 'ri-mail-send-line', size: 24, alpha: 0.5 }}
      on:clicklabel4={clickLabel4Fun}
      clear
    />
  </div>
</div>
