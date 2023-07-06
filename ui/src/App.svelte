<script>
    import Router, { querystring, location, push } from 'svelte-spa-router';
    import { routes } from './route';
    import { NavBar, Icon, Mask, Loading, Skeleton, Divider } from 'stdf';
    import menuList from './data/menuList';
    import { getUrlParams } from "./pages/home/module/utils";

    // 循环 menuList，将所有元素的 childs 组成一个数组
    const menuListArr = menuList.reduce((acc, cur) => {
        if (cur.childs) {
            acc.push(...cur.childs);
        }
        return acc;
    }, []);
    console.log('menuListArr', menuListArr)

    const params = new URLSearchParams('?' + $querystring); //获取参数
    let theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    //截取字符?后面的所有字符
    let urlLang = window.location.href.split('?')[1];
    // let urlParams = new URLSearchParams(urlLang);
    let visible = false;
    let getParams = getUrlParams()
    console.log('getParams', getParams);
    let isDev = getParams.dev;

      $: showLeft = $location !== '/';
    //手动切换主题
    const toggleFun = () => {
        if (theme === 'dark') {
            // 切换到light
            theme = 'light';
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
        } else {
            // 切换到dark
            theme = 'dark';
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        }
    };
    const toHomeFun = () => {
        push(`/`);
    };

    const routeLoading = () => {
      visible = true;
    }

    const routeLoaded = () => {
      visible = false;
    }
</script>

<main class="bg-gray9 dark:bg-gray5 text-black dark:text-white/90 relative pb-5 text-justify w-screen antialiased" >
  <Mask visible={visible} backdropBlur="sm" opacity={0} on:clickMask={() => (visible = false)}>
    <div style="padding-top: 50vh"><Loading type={'4_1'} /></div>
  </Mask>
  {#if isDev}
    <div class="sticky z-10 top-0">
      <NavBar
        left={showLeft ? 'back' : ''}
        title={$location === '/'
              ? 'STDF 示例'
              : menuListArr.filter(item => item.nav === $location.substring(1))[0]['title_zh'] +
                ('示例')}
        rightSlot
        on:clickleft={toHomeFun}
        injClass="bg-white/60 dark:bg-gray1/60 backdrop-blur"
      >
        <div slot="right" class="flex text-center">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="h-12 w-10 leading-10 text-blue" on:click={() => push('/demo')}>
            示例
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="h-12 w-10 leading-10" on:click={toggleFun}>
            <Icon name={theme === 'dark' ? 'ri-moon-fill' : 'ri-sun-line'} theme={true} />
          </div>
        </div>
      </NavBar>
    </div>
  {/if}
  {#if visible}
    <div class="mx-2 rounded-xl p-2 shadow">
      <Skeleton type="img" width="full" height="32" iconRatio={0.3} padding="4" />
    </div>
    <div class="p-2 mt-6">
      <Divider />
      <div class="flex justify-between">
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
      </div>
      <div class="flex justify-between mt-4">
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
        <Skeleton width="16" height="16" />
      </div>
      <div class="mt-8">
        <Skeleton width="full" height="16" />
        <Skeleton width="full" height="12" padding="4" />
      </div>
    </div>
  {/if}
  <div class={visible ? 'hidden' : ''}>
    <Router routes={routes} on:routeLoading={routeLoading} on:routeLoaded={routeLoaded} />
  </div>
</main>
