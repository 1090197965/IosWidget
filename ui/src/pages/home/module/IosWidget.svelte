<script lang="ts">
  import { IHomeInfos, IWidgetRecordData } from "../../../interface/scriptable.interface";
  import gsap from "gsap";
  import { tick } from "svelte";
  import { getUrlParams } from "./utils";
  import scriptable from "../../../api/scriptable";

  export let infos:IHomeInfos;
  let path: string;
  let target: IWidgetRecordData;
  let drive: IWidgetRecordData;
  let emojiDom;
  let getParams = getUrlParams()
  console.log('getParams', getParams);

  $: target = infos?.target;
  $: drive = infos?.driveName;

  scriptable.getHomeInfos({
    driveName: getParams.driveName,
    target: getParams.target
  }).then((response) => {
    console.log('response', response);
    if (response.data.code === 0) {
      infos = response.data.data
    }
  });

  export const getEmojiDom = () => {
    console.log('emoji-content', emojiDom);
    return emojiDom;
  }

  export const setPath = async (sendPath, count, message) => {
    path = sendPath
    if (sendPath) {
      await tick();
      scriptable.sendMessage({
        driveName: getParams.driveName,
        target: getParams.target,
        emojiCount: count,
        emojiImg: sendPath,
        message: message
      }).then((response) => {
        console.log('response', response);
        if (response.data.code === 0) {

        }
      });

      gsap.from('.emoji-content', {
        x: '-=100',
        duration: 0.5,
        ease: "back.out(1.7)",
        onComplete: () => {

        }
      })
    }
  }

  const getTime = (time: string) => {
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }

  const getBatteryColor = (
    batteryLevel: number,
    batteryIsCharging = false,
  ): string => {
    batteryLevel = batteryLevel * 100;
    if (batteryLevel >= 70 || batteryIsCharging === true) {
      return '#4DDA67';
    }

    if (batteryLevel >= 40) {
      return '#ffffff';
    }

    if (batteryLevel > 10) {
      return '#FF9503';
    }

    return '#FF3B2F';
  }
</script>

<div class="flex flex-col py-1">
  {#if target && drive}
    <div class="flex-col bg-cover h-40 bg-no-repeat relative rounded-xl" style='{`background-image: url("${target.backgroundImg}")`}'>
      <div class="emoji-mark">
        <img bind:this={emojiDom} class="text-center pointer-events-none emoji-content w-20 h-20 m-5 unread" src={path} alt="">
      </div>
      <div class="absolute bottom-0 left-0 bg-[#696969] opacity-60 rounded-xl w-28 h-10 m-2 pt-0.5 pl-2" style="">
        <div class="text-white text-xs">↙{getTime(target.time)} ↗{getTime(drive.time)}</div>
        <div class="text-white text-sm">
          <span class="text-white">{Math.floor(target.batteryLevel * 100) + '%'}</span>
          <div class="relative inline-block">
            <svg t="1687851208645" class="icon inline-block" viewBox="0 0 1745 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4974" width="40" height="22"><path d="M1353.91512836 406.06401914V617.92755411c14.5365973 0 26.91587935-5.29216393 37.27267845-15.53098492 10.25567521-10.42421528 15.42986104-22.95518388 15.42986102-37.60975931V458.85082902c0-14.47760862-5.17418581-27.0085765-15.42143355-37.4327925-10.36522584-10.23882099-22.74450789-15.53098493-37.28110592-15.53098492v0.16854007zM1195.90020631 247.13897989H405.884587c-14.5365973 0-26.91587935 5.12362387-37.27267846 15.53941167-10.25567521 10.41578781-15.42986104 22.77821634-15.42986103 37.4327925v423.76077838c0 14.65457543 5.17418581 27.01700397 15.42143356 37.43279177 10.36522584 10.41578781 22.74450789 15.53941239 37.28110592 15.53941167h790.00719258c14.57873251 0 26.9495878-5.12362387 37.27267845-15.53941167 10.25567521-10.41578781 15.42986104-22.77821634 15.42986103-37.43279177V300.11961081c0-14.65457543-5.17418581-27.01700397-15.42143355-37.43279177-10.33151813-10.41578781-22.71080017-15.53941239-37.28110593-15.53941241zM405.884587 141.21142578h790.00719257c43.60979268 0 80.84876341 15.53941239 111.71691221 46.60980898 30.8681488 30.90185653 46.29800983 68.51161583 46.29800982 112.29837605 43.57608422 0 80.84876341 15.53941239 111.71691148 46.61823647 30.8681488 30.89342978 46.29800983 68.51161583 46.29800983 112.28994855v105.94440834c0 43.78675948-15.42986104 81.21955198-46.29800983 112.28994855-30.8681488 31.07882407-68.14082726 46.61823646-111.71691148 46.61823647 0 43.78675948-15.42986104 81.21955198-46.29800982 112.29837605-30.8681488 31.07039732-68.10711953 46.60980898-111.71691221 46.60980898H405.884587c-43.59293844 0-80.8656169-15.53941239-111.71691221-46.60980898C263.30795346 805.09151368 247.87809243 767.66714867 247.87809243 723.88038919V300.11961081c0-43.78675948 15.42986104-81.39651879 46.29800983-112.29837605C325.0189701 156.75083818 362.3000753 141.21142578 405.89301447 141.21142578z" p-id="4975" data-spm-anchor-id="a313x.7781069.0.i3" class="selected" fill="#dbdbdb"></path>
            </svg>
            <div class={`absolute opacity-90`} style={`
              width: ${Math.floor((target.batteryLevel < 0.1 ? 0.1 : target.batteryLevel) * 16)}px;
              background-color: ${getBatteryColor(target.batteryLevel)};
              height: 8px;
              top: 7px;
              left: 11px;
            `}></div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .unread {
	  filter: contrast(50%);
  }
</style>
