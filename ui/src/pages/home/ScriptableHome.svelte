<script lang="ts">
    import { Divider, Input, Button, Icon } from 'stdf';
    import IosWidget from "./module/IosWidget.svelte";
    import EmojiList from './module/imageList'
    import { IExcess } from "../../interface/scriptableHome.interface";
    import gsap from "gsap";
    import { Draggable } from "gsap/Draggable";
    gsap.registerPlugin(Draggable);
    import { tick } from "svelte";
    import { IWidgetRecordData } from "../../interface/scriptable.interface";

    let message: string;
    let time;
    let excessList:IExcess[] = []
    let widget;
    let excessTl = [];
    let excessTTL = 0.8
    let excessCount = 10;
    let rect:PointerEvent;
    let sendEmojiCount = 0;
    let imgRect:DOMRect;
    let emojiPath: string;
    let emojiList: any[] = EmojiList;

    // onMount(() => {
    // });

    const clickLabel4Fun = () => {
      console.log('1', 1)
    }

    const killEl = () => {
      // 清除上一次动画
      excessTl.forEach(item => item.kill());
      excessTl = []
    }

    const mouseDown = async (e: TouchEvent, path) => {
      if (e.targetTouches && e.targetTouches.length === 0) {
        return;
      }

      killEl();
      if (!emojiPath || emojiPath !== path) {
        emojiPath = path
        sendEmojiCount = 0;
      }

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
      imgRect = imgDom.getBoundingClientRect();
      imgRect.x = imgRect.x + 5;
      imgRect.y = imgRect.y - 10;
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

      startCount();
      console.log('excessTl', excessTl)
    }

    const createTouchAnimate = (className: string, startRect: DOMRect, endRect: DOMRect, option: any = {}, offset = 0) => {
      return gsap.fromTo(className, {
        rotation: 0,
        opacity: 1,
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
        scaleX: 1.2,
        scaleY: 1.2,
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

    const initDrag = () => {
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
    }

    const startCount = () => {
      excessTl.push(gsap.to('.send-emoji-count', {
        fontSize: function(index, target, targets) {
          return sendEmojiCount >= 999 ? 120 : (24 + ((sendEmojiCount / 999 * 24) * 4))
        },
        x: `random(-5}, +5})`,
        y: `random(-5}, +5})`,
        duration: 0.1,
        repeatRefresh: true,
        repeatDelay: 0,
        repeat: -1,
      }))
    }

    const isBatteryShow = (
      batteryLevel: number,
      batteryIsCharging = false,
    ): string => {
      batteryLevel = batteryLevel * 100;
      if (batteryLevel >= 70 || batteryIsCharging === true) {
        return 'dcHeight';
      }

      if (batteryLevel >= 30) {
        return 'dcMidden';
      }

      if (batteryLevel > 10) {
        return 'dcLow';
      }

      return 'dcLow';
    }

    const handleLoaded = async (event) => {
      const target:IWidgetRecordData = event.detail;
      emojiList = emojiList.filter(item => {
        if(item.show !== false){
          return true;
        }

        return item.name === isBatteryShow(target.batteryLevel, target.isCharging);
      }).map(item => {
        item.show = true;
        return item;
      })

      await tick();
      initDrag();
    }

    const handleSend = () => {
      var tl = gsap.timeline({repeat: 0});
      killEl();
      tl.to('.send-btn', {
        x: '+=500',
        ease: "elastic.inOut(1, 0.5)",
        duration: 1
      });
      tl.to(['.excess-emoji0', '.excess-emoji1'], {
        transform: `translate(${imgRect.x + 5}px, ${imgRect.y + 5}px) rotate(0) scale(1.2, 1.2)`,
        duration: 0.5
      })
      tl.to(['.excess-emoji0', '.excess-emoji1', '.send-emoji-count'], {
        x: '+=500',
        ease: "elastic.inOut(1, 0.5)",
        stagger: 0.03,
        onComplete: async () => {
          await widget.setPath(emojiPath, sendEmojiCount, message);
          message = '';
          sendEmojiCount = 0;
          emojiPath = '';
        }
      })
      tl.to('.send-btn', {
        x: 0,
        ease: "elastic.inOut(1, 0.5)",
        duration: 1
      });
    }
</script>

<div class="relative">
  <div class="pb-1 pt-1">
    <div class="mx-2 rounded-xl p-2 shadow">
      <IosWidget bind:this={widget} on:loaded={handleLoaded} />
    </div>
  </div>

  <div class="drag-content mt-5 overflow-scroll">
    <Divider />
    <div class="bg-gray7">
      {#each emojiList as emojiItem}
        {#if emojiItem.show !== false}
          <div class="inline-block w-1/4 p-2" style="vertical-align: top">
            <div class="bg-gray8 text-center emoji-wrap">
              <div
                class="drag-emoji relative"
                on:touchstart|preventDefault={(e) => mouseDown(e, emojiItem.path)}
                on:touchend|preventDefault={(e) => mouseUp(e, emojiItem.path)}
              >
                <img class="text-center pointer-events-none" src={`${emojiItem.path}`} alt="" style="width: 80px">
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  <div class={`send-emoji-count ${sendEmojiCount > 0 ? '' : 'hidden'}`}>X{sendEmojiCount}</div>
  <div class="pointer-events-none z-10">
    {#each excessList as excessEmoji, index}
      <img
        class={`absolute left-0 pointer-events-none z-10 excess-emoji${index % 2}`}
        src={`${excessEmoji.path}`} alt=""
        style="width: 80px;top: 0">
    {/each}
  </div>

  <div>
    <Input
      placeholder="文字是非必须的哈，可以只发表情"
      bind:value={message}
      on:clicklabel4={clickLabel4Fun}
      maxlength={30}
      clear
    />
    <Button state="info" on:click={handleSend}>
      <div class="send-btn inline-block">
        <Icon name="ri-mail-send-line" size={18} top={-2} />
        发送
      </div>
    </Button>
  </div>
</div>

<style>
  .send-emoji-count {
	  font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif, "宋体";
	  top: 35px;
	  position: absolute;
	  left: 130px;
	  z-index: 30;
	  color: #ffffff;
	  font-size: 24px;
	  font-weight: bold;
	  line-height: 100px;
	  text-align: left;
    text-shadow: 0 0 3px #000000;
	  /*-webkit-text-stroke: 1.5px #858585;*/
  }

  .emoji-wrap {
	  border-radius: 10px;
    width: 100%;
    height: 80px;
    vertical-align: middle;
	  display: flex;
	  align-content: center;
	  flex-wrap: wrap;
  }
</style>
