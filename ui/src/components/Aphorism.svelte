<script>
    import aphorisms from '../data/aphorisms'; //引入数据

    export let num = 0; //显示条数
    export let compact = false; //是否紧凑模式

    //从 aphorisms 随机取出 num 条数据
    const aphorismsList = aphorisms.sort(() => Math.random() - 0.5).slice(0, num);
</script>

<div class={`${compact ? '' : 'px-4 py-8 '}divide-y divide-black/5 dark:divide-white/5`}>
    {#each aphorismsList as item}
        <div class:py-6={num > 1}>
            <div class="text-sm text-justify">{item.text}</div>
            <div class="text-right mt-1" class:italic={item.fromItalic}>{item.from}</div>
        </div>
    {/each}
</div>
