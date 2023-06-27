<script lang="ts">
    import { push } from 'svelte-spa-router';
    import { Cell, Divider, Input } from 'stdf';
    import scriptable from "../../api/scriptable";
    import IosWidget from "./module/IosWidget.svelte";

    let infos;
    let message: string;

    scriptable.getHomeInfos().then((response) => {
      console.log('response', response);
      if (response.data.code === 0) {
        infos = response.data.data
      }
    });

    const clickLabel4Fun = () => {}
</script>

<div class="pb-1 pt-1">
  <Divider text="小组件预览" />
  <div class="mx-2 rounded-xl p-2 shadow">
    <IosWidget infos={infos} />
  </div>
</div>

<Input
  title="身份证号"
  placeholder="有啥想说的"
  bind:value={message}
  label4={{ name: 'ri-qr-scan-line', size: 16, alpha: 0.5 }}
  on:clicklabel4={clickLabel4Fun}
  clear
/>

<div class="flex flex-col py-1">
  <Divider text="组件Demo" />
  <Cell title="点击事件" detail="请点击我" on:click={() => push('/demo')} />
</div>
